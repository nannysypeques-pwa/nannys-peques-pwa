-- =========================================================================
-- NANNYS Y PEQUES - ESQUEMA DE BASE DE DATOS Y POLÍTICAS RLS SEGURAS
-- Modelo Zero-Trust / Least Privilege basado en roles y propiedad de datos.
-- Ejecutar en el SQL Editor del Dashboard de Supabase.
-- =========================================================================

-- =========================================================================
-- 0. FUNCIONES HELPER DE SEGURIDAD (SECURITY DEFINER)
-- =========================================================================

-- Retorna el email autenticado en minúsculas
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT LOWER(COALESCE(auth.jwt()->>'email', ''));
$$;

-- Retorna el rol del usuario autenticado en minúsculas (prioriza app_metadata)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT LOWER(COALESCE(auth.jwt()->'app_metadata'->>'role', auth.jwt()->'user_metadata'->>'role', auth.jwt()->>'role', ''));
$$;

-- Valida si el usuario actual es Staff o Administrador (Zero-Trust: no confía en user_metadata editable por cliente)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_email TEXT;
    user_uid UUID;
    app_role TEXT;
    is_in_staff BOOLEAN;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 1. Validar rol seguro en app_metadata (sólo asignable vía backend/service_role)
    app_role := LOWER(COALESCE(auth.jwt()->'app_metadata'->>'role', ''));
    IF app_role IN ('staff', 'admin', 'supervision', 'coordinacion') THEN
        RETURN TRUE;
    END IF;

    -- 2. Validar contra la tabla oficial staff
    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'staff'
    ) THEN
        SELECT EXISTS (
            SELECT 1 FROM public.staff
            WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
              AND (activo IS NOT FALSE)
        ) INTO is_in_staff;
        
        IF is_in_staff THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Valida si el usuario actual es una niñera verificada en la tabla nannys
CREATE OR REPLACE FUNCTION public.is_registered_nanny()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_uid UUID;
    user_email TEXT;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'nannys'
    ) THEN
        RETURN EXISTS (
            SELECT 1 FROM public.nannys
            WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
              AND (activo IS NOT FALSE)
        );
    END IF;

    RETURN FALSE;
END;
$$;

-- Valida si el usuario actual es un cliente/familia verificado en la tabla clientes
CREATE OR REPLACE FUNCTION public.is_registered_client()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_uid UUID;
    user_email TEXT;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'clientes'
    ) THEN
        RETURN EXISTS (
            SELECT 1 FROM public.clientes
            WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
              AND (activo IS NOT FALSE)
        );
    END IF;

    RETURN FALSE;
END;
$$;

-- Retorna el nombre de la niñera asociada al usuario autenticado
CREATE OR REPLACE FUNCTION public.get_current_nanny_name()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    n_name TEXT;
    user_uid UUID;
    user_email TEXT;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN '';
    END IF;

    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));

    -- 1. Prioridad: Buscar nombre oficial en tabla verificada nannys
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'nannys'
    ) THEN
        SELECT nombre INTO n_name
        FROM public.nannys
        WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
        LIMIT 1;

        IF n_name IS NOT NULL AND TRIM(n_name) <> '' THEN
            RETURN n_name;
        END IF;
    END IF;

    -- 2. Fallback compatible: user_metadata si aún no se ha sincronizado la tabla
    n_name := COALESCE(auth.jwt()->'user_metadata'->>'nombre', '');
    RETURN COALESCE(n_name, '');
END;
$$;

-- Valida si el usuario autenticado es la niñera asignada a una fila de servicio (por nombre verificado, email o evidencia de asistencia)
CREATE OR REPLACE FUNCTION public.is_nanny_of_service_row(
    row_nanny_nom TEXT,
    row_asistencia JSONB DEFAULT NULL,
    row_obs TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_uid UUID;
    user_email TEXT;
    db_nanny_nom TEXT;
    clean_row_nom TEXT;
    asist_nanny_email TEXT;
    first_word_user TEXT;
    first_word_row TEXT;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));
    clean_row_nom := LOWER(TRIM(COALESCE(row_nanny_nom, '')));

    -- 1. Validar por email dentro del objeto JSONB asistencia_nanny
    IF row_asistencia IS NOT NULL AND jsonb_typeof(row_asistencia) = 'object' THEN
        asist_nanny_email := LOWER(TRIM(COALESCE(row_asistencia->>'nanny_email', row_asistencia->>'email', '')));
        
        IF user_email <> '' AND asist_nanny_email <> '' AND user_email = asist_nanny_email THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- 2. Validar si el email de la niñera está contenido en el tag de observaciones
    IF row_obs IS NOT NULL AND user_email <> '' AND row_obs LIKE '%' || user_email || '%' THEN
        RETURN TRUE;
    END IF;

    -- 3. Obtener nombre oficial verificado desde la tabla nannys
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'nannys'
    ) THEN
        SELECT LOWER(TRIM(nombre)) INTO db_nanny_nom
        FROM public.nannys
        WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
        LIMIT 1;
    END IF;

    -- 4. Coincidencia estricta con nombre oficial verificado (Cero suplantación)
    IF clean_row_nom <> '' AND db_nanny_nom IS NOT NULL AND db_nanny_nom <> '' THEN
        IF clean_row_nom = db_nanny_nom 
           OR clean_row_nom LIKE '%' || db_nanny_nom || '%' 
           OR db_nanny_nom LIKE '%' || clean_row_nom || '%' THEN
            RETURN TRUE;
        END IF;

        -- Si el nombre contiene al menos 2 palabras (ej: "Ana Laura"), verificar que ambas coincidan para evitar colisiones
        IF position(' ' IN clean_row_nom) > 0 AND position(' ' IN db_nanny_nom) > 0 THEN
            IF split_part(db_nanny_nom, ' ', 1) = split_part(clean_row_nom, ' ', 1)
               AND split_part(db_nanny_nom, ' ', 2) = split_part(clean_row_nom, ' ', 2) THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Valida si el usuario autenticado es el cliente asociado a una fila de servicio (por email o nombre verificado)
CREATE OR REPLACE FUNCTION public.is_client_of_service_row(row_cli_email TEXT, row_cli_nom TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_uid UUID;
    user_email TEXT;
    db_cli_nom TEXT;
    clean_row_email TEXT;
    clean_row_nom TEXT;
BEGIN
    user_uid := auth.uid();
    IF user_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    user_email := LOWER(COALESCE(auth.jwt()->>'email', ''));
    clean_row_email := LOWER(COALESCE(row_cli_email, ''));
    clean_row_nom := LOWER(COALESCE(row_cli_nom, ''));

    -- 1. Coincidencia directa por email
    IF user_email <> '' AND clean_row_email <> '' AND user_email = clean_row_email THEN
        RETURN TRUE;
    END IF;

    -- 2. Coincidencia con nombre oficial registrado en tabla clientes
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'clientes'
    ) THEN
        SELECT LOWER(TRIM(nombre)) INTO db_cli_nom
        FROM public.clientes
        WHERE (auth_user_id = user_uid OR LOWER(email) = user_email)
        LIMIT 1;

        IF db_cli_nom IS NOT NULL AND db_cli_nom <> '' AND clean_row_nom <> '' THEN
            IF clean_row_nom LIKE '%' || db_cli_nom || '%' OR db_cli_nom LIKE '%' || clean_row_nom || '%' THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Valida si una niñera autenticada tiene asignación operativa (servicios, bitácoras o planeaciones) con un cliente específico
CREATE OR REPLACE FUNCTION public.is_nanny_assigned_to_client(target_client_email TEXT, target_client_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_nanny_nom TEXT;
    clean_cli_email TEXT;
    clean_cli_nom TEXT;
    user_email TEXT;
BEGIN
    IF NOT public.is_registered_nanny() THEN
        RETURN FALSE;
    END IF;

    user_email := public.get_auth_email();
    current_nanny_nom := public.get_current_nanny_name();
    clean_cli_email := LOWER(TRIM(COALESCE(target_client_email, '')));
    clean_cli_nom := LOWER(TRIM(COALESCE(target_client_name, '')));

    -- 1. Servicios asignados en control_servicios
    IF EXISTS (
        SELECT 1 FROM public.control_servicios cs
        WHERE (
            (clean_cli_email <> '' AND LOWER(cs.cliente_email) = clean_cli_email)
            OR (clean_cli_nom <> '' AND LOWER(TRIM(cs.cliente_nombre)) = clean_cli_nom)
            OR (clean_cli_nom <> '' AND LOWER(cs.cliente_nombre) LIKE '%' || clean_cli_nom || '%')
        )
        AND public.is_nanny_of_service_row(cs.nanny_nombre, cs.asistencia_nanny, cs.observaciones)
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Bitácoras asociadas
    IF EXISTS (
        SELECT 1 FROM public.bitacoras b
        WHERE (
            (clean_cli_email <> '' AND LOWER(b.cliente_email) = clean_cli_email)
            OR (clean_cli_nom <> '' AND LOWER(TRIM(b.cliente_nombre)) = clean_cli_nom)
        )
        AND (
            LOWER(b.ninera_email) = user_email
            OR (current_nanny_nom <> '' AND LOWER(TRIM(b.ninera_nombre)) = LOWER(TRIM(current_nanny_nom)))
        )
    ) THEN
        RETURN TRUE;
    END IF;

    -- 3. Planeaciones asociadas
    IF EXISTS (
        SELECT 1 FROM public.planeaciones_neuronanny p
        WHERE (
            (clean_cli_email <> '' AND LOWER(p.cliente_email) = clean_cli_email)
            OR (clean_cli_nom <> '' AND LOWER(TRIM(p.cliente)) = clean_cli_nom)
        )
        AND (
            (current_nanny_nom <> '' AND LOWER(TRIM(p.nombre_ninera)) = LOWER(TRIM(current_nanny_nom)))
        )
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- =========================================================================
-- 1. TABLA: staff (PERSONAL ADMINISTRATIVO Y SUPERVISIÓN)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT DEFAULT 'staff',
    es_admin BOOLEAN DEFAULT FALSE,
    supervision BOOLEAN DEFAULT FALSE,
    rh BOOLEAN DEFAULT FALSE,
    telefono TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    emergencia TEXT DEFAULT '',
    ubicacion TEXT DEFAULT '',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff (email);
CREATE INDEX IF NOT EXISTS idx_staff_auth_uid ON public.staff (auth_user_id);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura staff" ON public.staff;
DROP POLICY IF EXISTS "Permitir insercion staff" ON public.staff;
DROP POLICY IF EXISTS "Permitir update staff" ON public.staff;
DROP POLICY IF EXISTS "Permitir delete staff" ON public.staff;
DROP POLICY IF EXISTS "RLS_SELECT_staff" ON public.staff;
DROP POLICY IF EXISTS "RLS_INSERT_staff" ON public.staff;
DROP POLICY IF EXISTS "RLS_UPDATE_staff" ON public.staff;
DROP POLICY IF EXISTS "RLS_DELETE_staff" ON public.staff;

CREATE POLICY "RLS_SELECT_staff" ON public.staff
    FOR SELECT TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_INSERT_staff" ON public.staff
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_staff_or_admin()
    );

CREATE POLICY "RLS_UPDATE_staff" ON public.staff
    FOR UPDATE TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_DELETE_staff" ON public.staff
    FOR DELETE TO authenticated
    USING (public.is_staff_or_admin());

-- Trigger de protección: impide que un usuario auto-actualice sus privilegios en staff
CREATE OR REPLACE FUNCTION public.check_staff_update_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Si es admin o staff autorizado por rol seguro, permite cualquier cambio
    IF public.is_staff_or_admin() THEN
        RETURN NEW;
    END IF;

    -- Si es el usuario vinculando su propia fila, prohibir cambiar roles o banderas de administración
    IF (NEW.es_admin IS DISTINCT FROM OLD.es_admin)
       OR (NEW.supervision IS DISTINCT FROM OLD.supervision)
       OR (NEW.rh IS DISTINCT FROM OLD.rh)
       OR (NEW.rol IS DISTINCT FROM OLD.rol)
       OR (NEW.activo IS DISTINCT FROM OLD.activo) THEN
        RAISE EXCEPTION 'No tienes autorización para modificar privilegios administrativos en staff.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_staff_update ON public.staff;
CREATE TRIGGER trg_protect_staff_update
    BEFORE UPDATE ON public.staff
    FOR EACH ROW
    EXECUTE FUNCTION public.check_staff_update_privileges();

-- =========================================================================
-- 2. TABLA: clientes (DIRECTORIO DE FAMILIAS)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY DEFAULT ('cli_' || substr(md5(random()::text), 1, 16)),
    auth_user_id UUID,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT DEFAULT '',
    ciudad TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    ubicacion TEXT DEFAULT '',
    peques TEXT DEFAULT '',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes (email);
CREATE INDEX IF NOT EXISTS idx_clientes_auth_uid ON public.clientes (auth_user_id);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir insercion clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir delete clientes" ON public.clientes;
DROP POLICY IF EXISTS "RLS_SELECT_clientes" ON public.clientes;
DROP POLICY IF EXISTS "RLS_INSERT_clientes" ON public.clientes;
DROP POLICY IF EXISTS "RLS_UPDATE_clientes" ON public.clientes;
DROP POLICY IF EXISTS "RLS_DELETE_clientes" ON public.clientes;

CREATE POLICY "RLS_SELECT_clientes" ON public.clientes
    FOR SELECT TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
        -- Permite a niñeras verificadas consultar únicamente las familias con asignación operativa activa
        OR (public.is_registered_nanny() AND public.is_nanny_assigned_to_client(email, nombre))
    );

CREATE POLICY "RLS_INSERT_clientes" ON public.clientes
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_UPDATE_clientes" ON public.clientes
    FOR UPDATE TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_DELETE_clientes" ON public.clientes
    FOR DELETE TO authenticated
    USING (public.is_staff_or_admin());

-- =========================================================================
-- 3. TABLA: nannys (DIRECTORIO DE NIÑERAS)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.nannys (
    id TEXT PRIMARY KEY DEFAULT ('nan_' || substr(md5(random()::text), 1, 16)),
    auth_user_id UUID,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT DEFAULT '',
    ciudad TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    foto TEXT DEFAULT '',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.nannys ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.nannys ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_nannys_email ON public.nannys (email);
CREATE INDEX IF NOT EXISTS idx_nannys_auth_uid ON public.nannys (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_nannys_nombre ON public.nannys (nombre);

ALTER TABLE public.nannys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura nannys" ON public.nannys;
DROP POLICY IF EXISTS "Permitir insercion nannys" ON public.nannys;
DROP POLICY IF EXISTS "Permitir update nannys" ON public.nannys;
DROP POLICY IF EXISTS "Permitir delete nannys" ON public.nannys;
DROP POLICY IF EXISTS "RLS_SELECT_nannys" ON public.nannys;
DROP POLICY IF EXISTS "RLS_INSERT_nannys" ON public.nannys;
DROP POLICY IF EXISTS "RLS_UPDATE_nannys" ON public.nannys;
DROP POLICY IF EXISTS "RLS_DELETE_nannys" ON public.nannys;

CREATE POLICY "RLS_SELECT_nannys" ON public.nannys
    FOR SELECT TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
        -- Permite a niñeras registradas y activas consultar directorio operativo de compañeras
        OR (public.is_registered_nanny() AND activo IS NOT FALSE)
    );

CREATE POLICY "RLS_INSERT_nannys" ON public.nannys
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_UPDATE_nannys" ON public.nannys
    FOR UPDATE TO authenticated
    USING (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(email) = public.get_auth_email()
        OR auth_user_id = auth.uid()
    );

CREATE POLICY "RLS_DELETE_nannys" ON public.nannys
    FOR DELETE TO authenticated
    USING (public.is_staff_or_admin());

-- =========================================================================
-- 4. TABLA: control_servicios (MATRIZ DE SERVICIOS EN TIEMPO REAL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.control_servicios (
    id TEXT PRIMARY KEY,
    semana_iso TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    lun_inicio TEXT DEFAULT '',
    lun_fin TEXT DEFAULT '',
    mar_inicio TEXT DEFAULT '',
    mar_fin TEXT DEFAULT '',
    mie_inicio TEXT DEFAULT '',
    mie_fin TEXT DEFAULT '',
    jue_inicio TEXT DEFAULT '',
    jue_fin TEXT DEFAULT '',
    vie_inicio TEXT DEFAULT '',
    vie_fin TEXT DEFAULT '',
    sab_inicio TEXT DEFAULT '',
    sab_fin TEXT DEFAULT '',
    dom_inicio TEXT DEFAULT '',
    dom_fin TEXT DEFAULT '',
    tipo_servicio TEXT DEFAULT '',
    cliente_email TEXT DEFAULT '',
    cliente_nombre TEXT DEFAULT '',
    ok_cliente BOOLEAN DEFAULT FALSE,
    zona TEXT DEFAULT '',
    nanny_nombre TEXT DEFAULT '',
    ok_nanny BOOLEAN DEFAULT FALSE,
    tarifa_cliente TEXT DEFAULT '',
    tarifa_nanny TEXT DEFAULT '',
    alerta TEXT DEFAULT '',
    observaciones TEXT DEFAULT '',
    bloque TEXT DEFAULT 'servicios_fijos',
    saldo_cliente TEXT DEFAULT '',
    pago_nanny TEXT DEFAULT '',
    ciudad TEXT DEFAULT 'Puebla',
    asistencia_nanny JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.control_servicios ADD COLUMN IF NOT EXISTS bloque TEXT DEFAULT 'servicios_fijos';
ALTER TABLE public.control_servicios ADD COLUMN IF NOT EXISTS saldo_cliente TEXT DEFAULT '';
ALTER TABLE public.control_servicios ADD COLUMN IF NOT EXISTS pago_nanny TEXT DEFAULT '';
ALTER TABLE public.control_servicios ADD COLUMN IF NOT EXISTS ciudad TEXT DEFAULT 'Puebla';
ALTER TABLE public.control_servicios ADD COLUMN IF NOT EXISTS asistencia_nanny JSONB DEFAULT '{}'::jsonb;

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_control_servicios_semana ON public.control_servicios (semana_iso, orden);
CREATE INDEX IF NOT EXISTS idx_control_servicios_ciudad ON public.control_servicios (semana_iso, ciudad, orden);
CREATE INDEX IF NOT EXISTS idx_control_servicios_bloque ON public.control_servicios (semana_iso, bloque, orden);
CREATE INDEX IF NOT EXISTS idx_control_servicios_cli_email ON public.control_servicios (cliente_email, semana_iso);
CREATE INDEX IF NOT EXISTS idx_control_servicios_nanny_nom ON public.control_servicios (nanny_nombre, semana_iso);

-- REPLICA IDENTITY FULL requerido para Realtime con RLS
ALTER TABLE public.control_servicios REPLICA IDENTITY FULL;

ALTER TABLE public.control_servicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "Permitir insercion control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "Permitir update control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "Permitir delete control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "RLS_SELECT_control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "RLS_INSERT_control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "RLS_UPDATE_control_servicios" ON public.control_servicios;
DROP POLICY IF EXISTS "RLS_DELETE_control_servicios" ON public.control_servicios;

CREATE POLICY "RLS_SELECT_control_servicios" ON public.control_servicios 
    FOR SELECT TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(nanny_nombre, asistencia_nanny, observaciones)
    );

CREATE POLICY "RLS_INSERT_control_servicios" ON public.control_servicios 
    FOR INSERT TO authenticated 
    WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "RLS_UPDATE_control_servicios" ON public.control_servicios 
    FOR UPDATE TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(nanny_nombre, asistencia_nanny, observaciones)
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(nanny_nombre, asistencia_nanny, observaciones)
    );

CREATE POLICY "RLS_DELETE_control_servicios" ON public.control_servicios 
    FOR DELETE TO authenticated 
    USING (public.is_staff_or_admin());

-- Trigger de protección de integridad: impide que usuarios no administradores modifiquen tarifas, horarios o asignaciones
CREATE OR REPLACE FUNCTION public.check_control_servicios_update_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Administradores y Staff tienen control operativo y financiero completo
    IF public.is_staff_or_admin() THEN
        RETURN NEW;
    END IF;

    -- Validar que clientes y niñeras no puedan alterar tarifas, pagos, saldos o parámetros estructurales del servicio
    IF (NEW.tarifa_cliente IS DISTINCT FROM OLD.tarifa_cliente)
       OR (NEW.tarifa_nanny IS DISTINCT FROM OLD.tarifa_nanny)
       OR (NEW.saldo_cliente IS DISTINCT FROM OLD.saldo_cliente)
       OR (NEW.pago_nanny IS DISTINCT FROM OLD.pago_nanny)
       OR (NEW.tipo_servicio IS DISTINCT FROM OLD.tipo_servicio)
       OR (NEW.bloque IS DISTINCT FROM OLD.bloque)
       OR (NEW.orden IS DISTINCT FROM OLD.orden)
       OR (NEW.zona IS DISTINCT FROM OLD.zona)
       OR (NEW.semana_iso IS DISTINCT FROM OLD.semana_iso)
       OR (NEW.cliente_email IS DISTINCT FROM OLD.cliente_email)
       OR (NEW.cliente_nombre IS DISTINCT FROM OLD.cliente_nombre)
       OR (NEW.nanny_nombre IS DISTINCT FROM OLD.nanny_nombre)
       OR (NEW.lun_inicio IS DISTINCT FROM OLD.lun_inicio)
       OR (NEW.lun_fin IS DISTINCT FROM OLD.lun_fin)
       OR (NEW.mar_inicio IS DISTINCT FROM OLD.mar_inicio)
       OR (NEW.mar_fin IS DISTINCT FROM OLD.mar_fin)
       OR (NEW.mie_inicio IS DISTINCT FROM OLD.mie_inicio)
       OR (NEW.mie_fin IS DISTINCT FROM OLD.mie_fin)
       OR (NEW.jue_inicio IS DISTINCT FROM OLD.jue_inicio)
       OR (NEW.jue_fin IS DISTINCT FROM OLD.jue_fin)
       OR (NEW.vie_inicio IS DISTINCT FROM OLD.vie_inicio)
       OR (NEW.vie_fin IS DISTINCT FROM OLD.vie_fin)
       OR (NEW.sab_inicio IS DISTINCT FROM OLD.sab_inicio)
       OR (NEW.sab_fin IS DISTINCT FROM OLD.sab_fin)
       OR (NEW.dom_inicio IS DISTINCT FROM OLD.dom_inicio)
       OR (NEW.dom_fin IS DISTINCT FROM OLD.dom_fin) THEN
        RAISE EXCEPTION 'Acceso denegado: No tienes autorización para modificar tarifas, horarios o asignaciones en el servicio.';
    END IF;

    -- Si el usuario autenticado actúa como cliente: prohibir alterar la confirmación de la niñera
    IF public.is_client_of_service_row(OLD.cliente_email, OLD.cliente_nombre)
       AND NOT public.is_nanny_of_service_row(OLD.nanny_nombre, OLD.asistencia_nanny, OLD.observaciones) THEN
        IF (NEW.ok_nanny IS DISTINCT FROM OLD.ok_nanny)
           OR (NEW.asistencia_nanny IS DISTINCT FROM OLD.asistencia_nanny) THEN
            RAISE EXCEPTION 'Acceso denegado: El cliente no puede modificar la confirmación o asistencia de la niñera.';
        END IF;
    END IF;

    -- Si el usuario autenticado actúa como niñera: prohibir alterar la confirmación del cliente
    IF public.is_nanny_of_service_row(OLD.nanny_nombre, OLD.asistencia_nanny, OLD.observaciones)
       AND NOT public.is_client_of_service_row(OLD.cliente_email, OLD.cliente_nombre) THEN
        IF (NEW.ok_cliente IS DISTINCT FROM OLD.ok_cliente) THEN
            RAISE EXCEPTION 'Acceso denegado: La niñera no puede modificar la confirmación de la familia.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_control_servicios_update ON public.control_servicios;
CREATE TRIGGER trg_protect_control_servicios_update
    BEFORE UPDATE ON public.control_servicios
    FOR EACH ROW
    EXECUTE FUNCTION public.check_control_servicios_update_privileges();

-- Realtime para control_servicios
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'control_servicios'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.control_servicios;
    END IF;
END $$;

-- =========================================================================
-- 5. TABLA: bitacoras (REPORTE DIARIO DE SERVICIO)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.bitacoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT DEFAULT '',
    ninera_nombre TEXT NOT NULL,
    ninera_email TEXT DEFAULT '',
    tipo_servicio TEXT DEFAULT '',
    servicio_id TEXT DEFAULT '',
    respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
    estado TEXT DEFAULT 'borrador',
    acepta TEXT DEFAULT '',
    fecha_acepta TIMESTAMP WITH TIME ZONE,
    revisada TEXT DEFAULT '',
    fecha_revisada TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_bitacora_fecha_cliente_ninera UNIQUE (fecha, cliente_nombre, ninera_nombre)
);

CREATE INDEX IF NOT EXISTS idx_bitacoras_fecha ON public.bitacoras (fecha);
CREATE INDEX IF NOT EXISTS idx_bitacoras_cliente ON public.bitacoras (cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_bitacoras_cli_email ON public.bitacoras (cliente_email);
CREATE INDEX IF NOT EXISTS idx_bitacoras_ninera ON public.bitacoras (ninera_nombre);
CREATE INDEX IF NOT EXISTS idx_bitacoras_ninera_email ON public.bitacoras (ninera_email);
CREATE INDEX IF NOT EXISTS idx_bitacoras_actualizado ON public.bitacoras (actualizado_en);

-- REPLICA IDENTITY FULL requerido para Realtime con RLS
ALTER TABLE public.bitacoras REPLICA IDENTITY FULL;

ALTER TABLE public.bitacoras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "Permitir insercion bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "Permitir update bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "Permitir delete bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "RLS_SELECT_bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "RLS_INSERT_bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "RLS_UPDATE_bitacoras" ON public.bitacoras;
DROP POLICY IF EXISTS "RLS_DELETE_bitacoras" ON public.bitacoras;

CREATE POLICY "RLS_SELECT_bitacoras" ON public.bitacoras 
    FOR SELECT TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(cliente_email) = public.get_auth_email()
        OR LOWER(ninera_email) = public.get_auth_email()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(ninera_nombre, NULL, NULL)
    );

CREATE POLICY "RLS_INSERT_bitacoras" ON public.bitacoras 
    FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(ninera_email) = public.get_auth_email()
        OR public.is_nanny_of_service_row(ninera_nombre, NULL, NULL)
    );

CREATE POLICY "RLS_UPDATE_bitacoras" ON public.bitacoras 
    FOR UPDATE TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(cliente_email) = public.get_auth_email()
        OR LOWER(ninera_email) = public.get_auth_email()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(ninera_nombre, NULL, NULL)
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(cliente_email) = public.get_auth_email()
        OR LOWER(ninera_email) = public.get_auth_email()
        OR public.is_client_of_service_row(cliente_email, cliente_nombre)
        OR public.is_nanny_of_service_row(ninera_nombre, NULL, NULL)
    );

CREATE POLICY "RLS_DELETE_bitacoras" ON public.bitacoras 
    FOR DELETE TO authenticated 
    USING (public.is_staff_or_admin());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'bitacoras'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bitacoras;
    END IF;
END $$;

-- =========================================================================
-- 6. TABLA: planeaciones_neuronanny (PLANEACIONES DE ACTIVIDADES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.planeaciones_neuronanny (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    cliente TEXT NOT NULL,
    cliente_email TEXT DEFAULT '',
    nombre_ninera TEXT NOT NULL,
    edad_nino TEXT DEFAULT '',
    area_desarrollo TEXT DEFAULT '',
    objetivo TEXT DEFAULT '',
    descripcion TEXT DEFAULT '',
    materiales TEXT DEFAULT '',
    imagen TEXT DEFAULT '',
    ciudad TEXT DEFAULT '',
    estado_revision TEXT DEFAULT 'pendiente',
    observaciones_supervision TEXT DEFAULT '',
    fecha_revision TIMESTAMP WITH TIME ZONE,
    fecha_correccion TIMESTAMP WITH TIME ZONE,
    fecha_envio_correccion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_planeacion_fecha_cliente_ninera UNIQUE (fecha, cliente, nombre_ninera)
);

CREATE INDEX IF NOT EXISTS idx_planeaciones_fecha ON public.planeaciones_neuronanny (fecha);
CREATE INDEX IF NOT EXISTS idx_planeaciones_cliente ON public.planeaciones_neuronanny (cliente);
CREATE INDEX IF NOT EXISTS idx_planeaciones_cli_email ON public.planeaciones_neuronanny (cliente_email);
CREATE INDEX IF NOT EXISTS idx_planeaciones_ninera ON public.planeaciones_neuronanny (nombre_ninera);
CREATE INDEX IF NOT EXISTS idx_planeaciones_estado ON public.planeaciones_neuronanny (estado_revision);

ALTER TABLE public.planeaciones_neuronanny ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura planeaciones_neuronanny" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "Permitir insercion planeaciones_neuronanny" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "Permitir update planeaciones_neuronanny" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "Permitir delete planeaciones_neuronanny" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "RLS_SELECT_planeaciones" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "RLS_INSERT_planeaciones" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "RLS_UPDATE_planeaciones" ON public.planeaciones_neuronanny;
DROP POLICY IF EXISTS "RLS_DELETE_planeaciones" ON public.planeaciones_neuronanny;

CREATE POLICY "RLS_SELECT_planeaciones" ON public.planeaciones_neuronanny 
    FOR SELECT TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(cliente_email) = public.get_auth_email()
        OR LOWER(nombre_ninera) = LOWER(public.get_current_nanny_name())
    );

CREATE POLICY "RLS_INSERT_planeaciones" ON public.planeaciones_neuronanny 
    FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(nombre_ninera) = LOWER(public.get_current_nanny_name())
    );

CREATE POLICY "RLS_UPDATE_planeaciones" ON public.planeaciones_neuronanny 
    FOR UPDATE TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(nombre_ninera) = LOWER(public.get_current_nanny_name())
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(nombre_ninera) = LOWER(public.get_current_nanny_name())
    );

CREATE POLICY "RLS_DELETE_planeaciones" ON public.planeaciones_neuronanny 
    FOR DELETE TO authenticated 
    USING (public.is_staff_or_admin());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'planeaciones_neuronanny'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.planeaciones_neuronanny;
    END IF;
END $$;

-- =========================================================================
-- 7. TABLA: confirmaciones_asistencia (CHECK-IN / CHECK-OUT)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.confirmaciones_asistencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id TEXT NOT NULL,
    row_id TEXT NOT NULL,
    semana_iso TEXT NOT NULL,
    fecha DATE NOT NULL,
    dia_clave TEXT NOT NULL,
    horario TEXT NOT NULL,
    nanny_nombre TEXT NOT NULL,
    nanny_email TEXT DEFAULT '',
    cliente_nombre TEXT NOT NULL,
    tipo_servicio TEXT DEFAULT '',
    confirmado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_agent TEXT DEFAULT '',
    detalles JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_conf_asistencia_semana ON public.confirmaciones_asistencia (semana_iso);
CREATE INDEX IF NOT EXISTS idx_conf_asistencia_nanny ON public.confirmaciones_asistencia (nanny_nombre);
CREATE INDEX IF NOT EXISTS idx_conf_asistencia_nanny_email ON public.confirmaciones_asistencia (nanny_email);
CREATE INDEX IF NOT EXISTS idx_conf_asistencia_fecha ON public.confirmaciones_asistencia (fecha);
CREATE INDEX IF NOT EXISTS idx_conf_asistencia_row ON public.confirmaciones_asistencia (row_id);

-- REPLICA IDENTITY FULL requerido para Realtime con RLS
ALTER TABLE public.confirmaciones_asistencia REPLICA IDENTITY FULL;

ALTER TABLE public.confirmaciones_asistencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura confirmaciones_asistencia" ON public.confirmaciones_asistencia;
DROP POLICY IF EXISTS "Permitir insercion confirmaciones_asistencia" ON public.confirmaciones_asistencia;
DROP POLICY IF EXISTS "Permitir update confirmaciones_asistencia" ON public.confirmaciones_asistencia;
DROP POLICY IF EXISTS "RLS_SELECT_confirmaciones_asistencia" ON public.confirmaciones_asistencia;
DROP POLICY IF EXISTS "RLS_INSERT_confirmaciones_asistencia" ON public.confirmaciones_asistencia;
DROP POLICY IF EXISTS "RLS_UPDATE_confirmaciones_asistencia" ON public.confirmaciones_asistencia;

CREATE POLICY "RLS_SELECT_confirmaciones_asistencia" ON public.confirmaciones_asistencia 
    FOR SELECT TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(nanny_email) = public.get_auth_email()
        OR public.is_nanny_of_service_row(nanny_nombre, NULL, NULL)
    );

CREATE POLICY "RLS_INSERT_confirmaciones_asistencia" ON public.confirmaciones_asistencia 
    FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(nanny_email) = public.get_auth_email()
        OR public.is_nanny_of_service_row(nanny_nombre, NULL, NULL)
    );

CREATE POLICY "RLS_UPDATE_confirmaciones_asistencia" ON public.confirmaciones_asistencia 
    FOR UPDATE TO authenticated 
    USING (
        public.is_staff_or_admin()
        OR LOWER(nanny_email) = public.get_auth_email()
        OR public.is_nanny_of_service_row(nanny_nombre, NULL, NULL)
    )
    WITH CHECK (
        public.is_staff_or_admin()
        OR LOWER(nanny_email) = public.get_auth_email()
        OR public.is_nanny_of_service_row(nanny_nombre, NULL, NULL)
    );

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'confirmaciones_asistencia'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.confirmaciones_asistencia;
    END IF;
END $$;

-- =========================================================================
-- 8. TABLA: clientes_eventuales (CLIENTES TEMPORALES / EVENTUALES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.clientes_eventuales (
    id TEXT PRIMARY KEY DEFAULT ('ce_' || substr(md5(random()::text), 1, 16)),
    nombre TEXT NOT NULL DEFAULT '',
    email TEXT DEFAULT '',
    telefono TEXT DEFAULT '',
    ciudad TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    ubicacion TEXT DEFAULT '',
    peque_edad TEXT DEFAULT '',
    edad_peque TEXT DEFAULT '',
    notas TEXT DEFAULT '',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.clientes_eventuales ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.clientes_eventuales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "Permitir insercion clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "Permitir update clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "Permitir delete clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_SELECT_clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_INSERT_clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_UPDATE_clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_DELETE_clientes_eventuales" ON public.clientes_eventuales;

CREATE POLICY "RLS_SELECT_clientes_eventuales" ON public.clientes_eventuales 
    FOR SELECT TO authenticated 
    USING (public.is_staff_or_admin());

CREATE POLICY "RLS_INSERT_clientes_eventuales" ON public.clientes_eventuales 
    FOR INSERT TO authenticated 
    WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "RLS_UPDATE_clientes_eventuales" ON public.clientes_eventuales 
    FOR UPDATE TO authenticated 
    USING (public.is_staff_or_admin())
    WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "RLS_DELETE_clientes_eventuales" ON public.clientes_eventuales 
    FOR DELETE TO authenticated 
    USING (public.is_staff_or_admin());

-- =========================================================================
-- 9. STORAGE BUCKETS (evidencias, perfiles, planeaciones)
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('evidencias', 'evidencias', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('perfiles', 'perfiles', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('planeaciones', 'planeaciones', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Permitir lectura publica evidencias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida evidencias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion evidencias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion evidencias" ON storage.objects;
DROP POLICY IF EXISTS "RLS_SELECT_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "RLS_INSERT_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "RLS_UPDATE_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "RLS_DELETE_evidencias" ON storage.objects;

CREATE POLICY "RLS_SELECT_evidencias" ON storage.objects
    FOR SELECT TO authenticated 
    USING (
        bucket_id = 'evidencias'
        AND (
            public.is_staff_or_admin()
            OR public.is_registered_nanny()
            OR public.is_registered_client()
        )
    );

CREATE POLICY "RLS_INSERT_evidencias" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (
        bucket_id = 'evidencias'
        AND (
            public.is_staff_or_admin()
            OR public.is_registered_nanny()
            OR public.is_registered_client()
        )
    );

CREATE POLICY "RLS_UPDATE_evidencias" ON storage.objects
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'evidencias' AND (public.is_staff_or_admin() OR owner = auth.uid())) 
    WITH CHECK (bucket_id = 'evidencias' AND (public.is_staff_or_admin() OR owner = auth.uid()));

CREATE POLICY "RLS_DELETE_evidencias" ON storage.objects
    FOR DELETE TO authenticated 
    USING (bucket_id = 'evidencias' AND (public.is_staff_or_admin() OR owner = auth.uid()));


DROP POLICY IF EXISTS "Permitir lectura publica perfiles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida perfiles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion perfiles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion perfiles" ON storage.objects;
DROP POLICY IF EXISTS "RLS_SELECT_perfiles" ON storage.objects;
DROP POLICY IF EXISTS "RLS_INSERT_perfiles" ON storage.objects;
DROP POLICY IF EXISTS "RLS_UPDATE_perfiles" ON storage.objects;
DROP POLICY IF EXISTS "RLS_DELETE_perfiles" ON storage.objects;

-- Los perfiles son públicos para visualización de avatares en la app
CREATE POLICY "RLS_SELECT_perfiles" ON storage.objects
    FOR SELECT TO public 
    USING (bucket_id = 'perfiles');

CREATE POLICY "RLS_INSERT_perfiles" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (
        bucket_id = 'perfiles'
        AND (
            public.is_staff_or_admin()
            OR public.is_registered_nanny()
            OR public.is_registered_client()
        )
    );

CREATE POLICY "RLS_UPDATE_perfiles" ON storage.objects
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'perfiles' AND (public.is_staff_or_admin() OR owner = auth.uid())) 
    WITH CHECK (bucket_id = 'perfiles' AND (public.is_staff_or_admin() OR owner = auth.uid()));

CREATE POLICY "RLS_DELETE_perfiles" ON storage.objects
    FOR DELETE TO authenticated 
    USING (bucket_id = 'perfiles' AND (public.is_staff_or_admin() OR owner = auth.uid()));


DROP POLICY IF EXISTS "Permitir lectura publica planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "RLS_SELECT_planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "RLS_INSERT_planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "RLS_UPDATE_planeaciones" ON storage.objects;
DROP POLICY IF EXISTS "RLS_DELETE_planeaciones" ON storage.objects;

CREATE POLICY "RLS_SELECT_planeaciones" ON storage.objects
    FOR SELECT TO authenticated 
    USING (
        bucket_id = 'planeaciones'
        AND (
            public.is_staff_or_admin()
            OR public.is_registered_nanny()
            OR public.is_registered_client()
        )
    );

CREATE POLICY "RLS_INSERT_planeaciones" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (
        bucket_id = 'planeaciones'
        AND (
            public.is_staff_or_admin()
            OR public.is_registered_nanny()
        )
    );

CREATE POLICY "RLS_UPDATE_planeaciones" ON storage.objects
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'planeaciones' AND (public.is_staff_or_admin() OR owner = auth.uid())) 
    WITH CHECK (bucket_id = 'planeaciones' AND (public.is_staff_or_admin() OR owner = auth.uid()));

CREATE POLICY "RLS_DELETE_planeaciones" ON storage.objects
    FOR DELETE TO authenticated 
    USING (bucket_id = 'planeaciones' AND (public.is_staff_or_admin() OR owner = auth.uid()));

-- =========================================================================
-- 10. ÍNDICES DE ALTO RENDIMIENTO (OPTIMIZACIÓN DE CONSULTAS Y VELOCIDAD)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_control_servicios_semana_orden ON public.control_servicios(semana_iso, orden ASC);
CREATE INDEX IF NOT EXISTS idx_control_servicios_ciudad ON public.control_servicios(ciudad);
CREATE INDEX IF NOT EXISTS idx_control_servicios_bloque ON public.control_servicios(bloque);

CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_nombre ON public.clientes_eventuales(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_telefono ON public.clientes_eventuales(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_email ON public.clientes_eventuales(email);
CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_ciudad ON public.clientes_eventuales(ciudad);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON public.clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_ciudad ON public.clientes(ciudad);

CREATE INDEX IF NOT EXISTS idx_nannys_email ON public.nannys(email);
CREATE INDEX IF NOT EXISTS idx_nannys_nombre ON public.nannys(nombre);
CREATE INDEX IF NOT EXISTS idx_nannys_ciudad ON public.nannys(ciudad);

-- =========================================================================
-- 11. RECARGAR CACHÉ DE ESQUEMA POSTGREST
-- =========================================================================
NOTIFY pgrst, 'reload schema';


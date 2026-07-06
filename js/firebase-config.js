/**
 * CONFIGURACIÓN DE FIREBASE - ESTIMULACIÓN
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7eALMmiPj7mbWexnve2QSwAQZtbro_GI",
  authDomain: "nyp-estimulacion.firebaseapp.com",
  projectId: "nyp-estimulacion",
  storageBucket: "nyp-estimulacion.firebasestorage.app",
  messagingSenderId: "908989839808",
  appId: "1:908989839808:web:30513e0e4a7c2d65c1b025"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2) Segundo Proyecto (Puntos Star)
const firebasePuntosConfig = {
  apiKey: "AIzaSyAmNSefWl31Nj7jEQWxe8W5TbZ-42jWVIU",
  authDomain: "nyp-puntos-star.firebaseapp.com",
  projectId: "nyp-puntos-star",
  storageBucket: "nyp-puntos-star.firebasestorage.app",
  messagingSenderId: "362268843800",
  appId: "1:362268843800:web:6dc1c4796a33df22c0886d"
};

const appPuntos = initializeApp(firebasePuntosConfig, "puntosApp");
const dbPuntos = getFirestore(appPuntos);

// 3) Configuración de Autenticación para Puntos Star (Opción A)
const puntosAuthConfig = {
  email: "nyp.supervision.pue@gmail.com"
};

export { db, dbPuntos, puntosAuthConfig };

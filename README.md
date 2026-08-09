# FitValen

Primera versión navegable de una aplicación web de entrenamiento, nutrición y seguimiento personal para móvil y ordenador.

## Incluye

- Inicio con entrenamiento del día, constancia, calorías, agua y peso.
- Rutinas semanales, progreso, volumen y récords personales.
- Entrenamiento activo con series, peso, repeticiones y descanso.
- Calendario semanal de entrenamientos y menús.
- Registro nutricional, macronutrientes e hidratación.
- Perfil, evolución corporal y actividad de amigos.
- Panel administrativo con validaciones, programación y accesos por función.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Estado actual

Esta entrega valida la experiencia, la navegación y las principales interacciones con datos de ejemplo. El siguiente hito técnico es conectar almacenamiento persistente y autenticación segura antes de utilizar datos personales reales.

## Seguridad pendiente

El acceso público mediante un PIN numérico de cuatro cifras sin límite de intentos no es seguro. No debe conectarse a datos reales hasta incorporar protección contra intentos automatizados y un sistema de autenticación de producción.

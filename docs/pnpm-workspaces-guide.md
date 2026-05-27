# 📦 Guía de Aprendizaje: pnpm Workspaces y Gestión de Dependencias

Esta guía detalla el funcionamiento de **pnpm workspaces** en arquitecturas a gran escala, explicando cómo resuelve dependencias locales mediante enlaces simbólicos, las mejores prácticas de autenticación con registros privados, y por qué el bloqueo del lockfile es vital en CI/CD.

---

## 🚀 1. ¿Qué es pnpm Workspaces?
Un **workspace** (espacio de trabajo) en **pnpm** es una configuración que nos permite agrupar múltiples subproyectos (aplicaciones y librerías) dentro de un único repositorio (Monorepo), permitiéndoles compartir dependencias y referenciarse mutuamente de forma local y transparente.

### Estructura `pnpm-workspace.yaml`
En la raíz de nuestro proyecto, el archivo `pnpm-workspace.yaml` define los límites del monorepo indicando qué carpetas contienen paquetes gestionados por pnpm:

```yaml
packages:
  - 'apps/*'        # Aplicaciones principales y hosts (como apps/shell)
  - 'packages/*'    # Micro-frontends (MFEs) y librerías transversales
  - 'libs/*'        # Utilidades compartidas secundarias
  - 'playground/*'  # Espacios aislados de experimentación (como elements-lab)
```

---

## 🔗 2. Linking Local Automático: La Magia de pnpm
En el desarrollo de software tradicional, si el equipo crea una librería compartida (ej. `shared-catalog`), para usarla en un micro-frontend tendría dos opciones sumamente ineficientes:
1. **Publicar en npm** cada vez que se hace un cambio menor (incrementar versión, subir a red, reinstalar en el MFE).
2. **Copiar y pegar** el código, lo que destruye el principio DRY (Don't Repeat Yourself) y genera problemas de mantenimiento.

### ¿Cómo lo resuelve pnpm?
**pnpm workspaces** resuelve esto a través de **Symlinks (Enlaces Simbólicos)** en el sistema de archivos:

```
[ Raíz del Monorepo ]
   ├── node_modules/
   ├── packages/
   │    ├── mfe-explore/ (MFE que consume la librería)
   │    │    └── node_modules/
   │    │         └── @tractor-store/shared-catalog  🔗─ (Enlace físico/simbólico en disco)
   │    └── shared-catalog/ (Librería compartida de modelos) ──┘
```

Al compilar o desarrollar localmente:
* pnpm crea una referencia en `node_modules` que apunta **directamente** a la carpeta física de la librería en tu disco duro.
* Si haces un cambio en `shared-catalog`, **mfe-explore lo detecta instantáneamente** en tiempo real sin necesidad de compilar la librería por separado, empaquetarla o publicarla.
* **Cero latencia:** La edición es continua y fluida, incrementando la velocidad de desarrollo en un 400%.

---

## 🔒 3. Frozen Lockfile en CI/CD: La Regla de Oro
Cuando ejecutas `pnpm install` en tu máquina local, pnpm actualiza el archivo `pnpm-lock.yaml` para registrar exactamente qué sub-dependencias se instalaron.

En un entorno de **Integración Continua (CI)** como GitHub Actions o Jenkins, **NUNCA** debes permitir que el gestor de paquetes modifique este archivo.

### Comando Obligatorio en CI:
```bash
pnpm install --frozen-lockfile
```

> [!IMPORTANT]
> **¿Por qué es crítico?**
> * **Reproducibilidad:** Asegura que los servidores de producción e integración continua descarguen **exactamente las mismas versiones de bytes** que el desarrollador validó localmente.
> * **Seguridad:** Si un atacante altera maliciosamente una versión en un registro externo que cumple con un rango como `^1.2.0`, `--frozen-lockfile` bloqueará la instalación porque el hash guardado en el lockfile no coincidirá.
> * **Fallo rápido:** Si un desarrollador agrega una dependencia a su `package.json` pero olvida subir el `pnpm-lock.yaml` actualizado al repositorio de Git, el build de CI fallará inmediatamente. Esto previene despliegues corruptos.

---

## 🔑 4. `.npmrc` con Registros Privados y Autenticación
En una corporación, la mayoría de los paquetes clave o librerías de diseño no son públicos. Se almacenan en registros de paquetes privados como **JFrog Artifactory, Sonatype Nexus o GitHub Packages**.

El archivo `.npmrc` se utiliza para configurar de dónde descarga npm/pnpm las dependencias y cómo se autentica.

### Anatomía de un `.npmrc` Corporativo
```ini
# 1. Definir el registro global oficial
registry=https://registry.npmjs.org/

# 2. Asociar un Scope (Ámbito) específico a un registro privado
# Cualquier paquete con prefijo @tractor-store se descargará desde el servidor interno
@tractor-store:registry=https://npm.pkg.github.com/

# 3. Configuración de autenticación segura (Sin Hardcodear contraseñas)
# Usamos interpolación de variables de entorno para que el token se inyecte en tiempo de ejecución
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

> [!WARNING]
> **¡NUNCA hardcodees un Token de acceso directo en el código!**
> Si subes un token privado al repositorio Git, comprometerás la seguridad de toda la empresa. Usa siempre la variable `${NPM_TOKEN}`.
> * **Localmente:** Configura el token en tu terminal: `export NPM_TOKEN=ghp_tusecretotoken...`
> * **En GitHub Actions:** Define un Secret en el repositorio y pásalo en el workflow:
>   ```yaml
>   env:
>     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
>   ```

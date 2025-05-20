# Usa una imagen de Node oficial
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json si existe
COPY package*.json ./

# Instala solo Axios
RUN npm install

# Copia el resto del código
COPY . .

# Comando que se ejecuta al iniciar
CMD ["node", "copartBuscar.js"]

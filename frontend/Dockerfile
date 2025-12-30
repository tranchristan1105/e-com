FROM node:22-alpine

WORKDIR /app

# L'ASTUCE EST ICI :
# On met "package*.json" au lieu de "package.json package-lock.json".
# L'étoile dit à Docker : "Prends tout ce qui commence par package et finit par json".
# Donc si package-lock.json n'est pas là, ça ne plante plus !
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
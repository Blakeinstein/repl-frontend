FROM replco/polygott:latest
WORKDIR /codepair/code
COPY package*.json ./
RUN npm install
EXPOSE 3030
COPY index.js ./
CMD [ "npm", "run", "start" ]
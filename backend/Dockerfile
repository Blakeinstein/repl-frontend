FROM replco/polygott:latest
WORKDIR /codepair/code
COPY package*.json ./
COPY index.js ./
RUN npm install
EXPOSE 3030
CMD [ "node", "run", "start" ]
docker rm -f director
docker image rm director:latest
docker image rm barnaby/director:latest
docker build -t director:latest .
docker tag director:latest barnaby/director:latest
docker login
docker push barnaby/director:latest
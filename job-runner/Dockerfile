FROM python:3.8-alpine

RUN mkdir /server

COPY ./ /server/

WORKDIR /server

RUN pip install -r requirements.txt

CMD [ "python3", "server.py" ]

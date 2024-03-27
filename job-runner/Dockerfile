FROM python:3.8

RUN mkdir /server

WORKDIR /server

COPY ./requirements.txt /server/

RUN pip install -r requirements.txt

COPY ./server.py ./generator.py /server/

CMD [ "python3", "-u", "server.py" ]

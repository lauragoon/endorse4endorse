#!/usr/bin/env python

from flask import Flask, request, redirect, url_for, render_template

app = Flask(__name__)

@app.route("/", methods = ["GET"])
def root():
    return "Hello"





if __name__ == "__main__":
    app.run()

# FlaskProject


## 1. Set up your conda enviorment :
The list of the packages used can be found in environment.yml.

you can create a new conda enviorment with the packages this way:

in the terminal in the current directory (FlaskProject) run:
> conda env create -f environment.yml

(*) make sure you have Anaconda installed in order to use a conda enviorment


## 2. Download and install PostgreSQL. 
We used the following credentials:

username - postgres (that's the default for postgresql)

password - 12345678

### (*) Create the database: 
in the terminal in the current directory (FlaskProject) run:

> Python

> \>>> from FlaskApp import db

> \>>> db.create_all()

(if importing doesn't work, use an explicit path to your Conda interpreter in step 1, eg run C:\ProgramData\Anaconda3\envs\FlaskProject3.7\python.exe instead of just "Python")


## 3. Install React packages 
(the packages list can be found in FlaskProject/react-frontend/packages.json)

go to FlaskProject/react-frontend and run npm install to install all packages

> cd react-frontend

> npm install

(*) make sure you have NodeJS installed in order to use React

## 4. Running the server:
Open a new terminal and run: (in FlaskProject)

> C:\ProgramData\Anaconda3\envs\FlaskProject3.7\python.exe run.py

* (use the path to your Conda interpreter)

## 5. Running the Client:
Open a new terminal, go to FlaskProject/react-frontend and run npm start

> cd react-frontend

> npm start


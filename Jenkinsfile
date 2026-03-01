pipeline {
    agent any
    triggers {
        githubPush()
    }
    environment {
        IMAGE_NAME = "ashwinemcbalaji/office-app"
        DOCKERHUB_CREDENTIALS = "dockerhub-cred1"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        bat """
                        ${scannerHome}\\bin\\sonar-scanner.bat ^
                        -Dsonar.projectKey=office-app ^
                        -Dsonar.projectName=OfficeApp ^
                        -Dsonar.sources=.
                        """
                    }
                }
            }
        }
        stage('Build Backend Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}-backend:latest", "./backend")
                }
            }
        }
        stage('Build Frontend Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}-frontend:latest", "./frontend")
                }
            }
        }
        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS) {
                        docker.image("${IMAGE_NAME}-backend:latest").push()
                        docker.image("${IMAGE_NAME}-frontend:latest").push()
                    }
                }
            }
        }
        stage('Deploy Containers') {
            steps {
                script {
                    // Stop and remove old containers
                    bat 'docker stop office-backend || exit 0'
                    bat 'docker rm office-backend || exit 0'
                    bat 'docker stop office-frontend || exit 0'
                    bat 'docker rm office-frontend || exit 0'

                    // Run backend
                    bat """
                    docker run -d -p 5000:5000 ^
                    --name office-backend ^
                    -e DATABASE_URL=%DATABASE_URL% ^
                    ashwin918/office-app-backend:latest
                    """

                    // Run frontend
                    bat """
                    docker run -d -p 3000:80 ^
                    --name office-frontend ^
                    ashwin918/office-app-frontend:latest
                    """
                }
            }
        }
    }
}

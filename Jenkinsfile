#!/usr/bin/env groovy

library identifier: 'jenkins-shared-library@master', retriever: modernSCM(
    [
        $class: 'GitSCMSource',
        remote: 'https://github.com/Ans-Saeed/jenkins-shared-library',
        credentialsId: 'github-credentials'
    ]
)

def gv
pipeline{
    agent any
    
        stages{
        stage("init"){            
            steps{
                script{
                 gv = load "script.groovy" //call or load the groovy script in gv variable

                }
            }
        }
        stage("test"){
                steps{
  
                 echo "Testing the application"
                echo "branch pipeline for ${BRANCH_NAME}"
            }
        }
        stage("build image"){
            // when {
            //     expression{
            //             BRANCH_NAME == 'master'
            //     }
            // }
            steps{
                
                script{
                echo 'building the image'
                builddockerImage'anssaeed/my-repo:cms1.2'
                dockerLogin()
                dockerPush'anssaeed/my-repo:cms1.2'
                }
            }
        }
        stage("deploy"){
            when {
                expression{
                        BRANCH_NAME == 'master'
                }
            }
        
            steps{
                script{
                    echo 'deploying the application'
                }
            }
        }
    }
}


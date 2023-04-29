#!/usr/bin/env groovy
@Library('jenkins-shared-library@master')
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
                builddockerImage'anssaeed/my-repo:cms1.1'
                dockerLogin()
                dockerPush'anssaeed/my-repo:cms1.1'
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


pipeline {
  agent any

  environment {
    // CI flags consumed by Playwright config
    CI = 'true'
    HEADLESS = 'true'

    // Provide these via Jenkins credentials or environment injection
    // EMAIL = credentials('EMAIL')
    // PASSWORD = credentials('PASSWORD')

    // Optional: used by Playwright baseURL
    // BASE_URL = 'https://grounded-topaz.vercel.app/dashboard'
  }

  options {
    timestamps()
    // Avoid long-hanging builds
    timeout(time: 60, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci || npm install'
      }
    }

    stage('Ensure Playwright browsers') {
      steps {
        sh 'npx playwright install --with-deps'
      }
    }

    stage('Auth storageState (auth/user.json)') {
      steps {
        // Strategy A (recommended): provide auth/user.json from Jenkins secret/artifact.
        // If the file already exists in the Jenkins workspace, it will be used.
        // Otherwise you must copy it from a Jenkins artifact/secret.

        // Example placeholder: if you have a Jenkins file credential containing auth/user.json,
        // you can write it into auth/user.json here.
        // sh 'cp path/to/secret/auth/user.json auth/user.json'

        sh '''
          if [ ! -f auth/user.json ]; then
            echo "Missing auth/user.json. CI strategy A requires you to provide it from Jenkins secrets/artifacts.";
            exit 1;
          fi
        '''
      }
    }

    stage('Run Playwright tests (CI)') {
      steps {
        sh '''
          rm -rf playwright-report results/playwright-results.json results/junit-results.xml || true
          mkdir -p results
          npx playwright test
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: [
        'playwright-report/**',
        'results/junit-results.xml',
        'results/playwright-results.json',
        'results/**/html-report/**',
        'test-results/**'
      ], allowEmptyArchive: true
    }

    failure {
      echo 'Playwright tests failed.'
    }
  }
}


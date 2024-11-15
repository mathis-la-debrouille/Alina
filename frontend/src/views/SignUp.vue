<template>
  <div class="signup-container">
    <h1>Sign Up</h1>
    <q-form ref="form" :model="formModel" :rules="rules">
      <!-- Input Fields -->
      <q-form-item label="First Name" prop="firstname">
        <q-input v-model="formModel.firstname" placeholder="Enter your first name" />
      </q-form-item>
      <q-form-item label="Email" prop="email">
        <q-input v-model="formModel.email" type="email" placeholder="Enter your email" />
      </q-form-item>
      <q-form-item label="Password" prop="password">
        <q-input v-model="formModel.password" type="password" placeholder="Enter your password" />
      </q-form-item>
      <q-form-item label="Alina ID" prop="alina_id">
        <q-input v-model="formModel.alina_id" placeholder="Enter your Alina ID" />
      </q-form-item>

      <div class="button-group">
        <q-button @click="handleSubmit">Sign Up</q-button>
        <q-button theme="link" @click="redirectToLogin">Login</q-button>
      </div>
    </q-form>

    <!-- Error Popup for Signup -->
    <div v-if="isSignupError" class="error-popup">
      <p>{{ signupErrorMessage }}</p>
      <q-button @click="isSignupError = false" theme="secondary">Close</q-button>
    </div>

    <!-- Splash Screen -->
    <div v-if="showSplashScreen" class="splash-screen">
      <p>Account created</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '@/apiService';

type FormType = {
  validate: () => Promise<boolean>;
  resetFields: () => void;
};

export default {
  name: 'SignupPage',
  setup() {
    const form = ref<FormType | null>(null);
    const router = useRouter();

    const formModel = reactive({
      firstname: '',
      email: '',
      password: '',
      alina_id: ''
    });

    const rules = reactive({
      firstname: { required: true, message: 'First name is required', trigger: 'blur' },
      email: { required: true, type: 'email', message: 'Valid email is required', trigger: 'blur' },
      password: { required: true, min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
      alina_id: { required: true, message: 'Alina ID is required', trigger: 'blur' }
    });

    const signupErrorMessages = [
      "An account with this email already exists.",
      "Invalid information provided. Please review and try again."
    ];

    const signupErrorMessage = ref(""); // Reactive error message
    const isSignupError = ref(false); // Controls the error popup display
    const showSplashScreen = ref(false); // Controls the splash screen display

    const handleSubmit = async () => {
      const valid = await form.value?.validate();
      if (valid) {
        try {
          const response = await signup({
            firstname: formModel.firstname,
            email: formModel.email,
            password: formModel.password,
            alina_id: formModel.alina_id,
          });

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.id.toString())
          showSplashScreen.value = true; // Show splash screen
          setTimeout(() => {
            showSplashScreen.value = false;
            router.push('/prompt'); // Redirect after 2 seconds
          }, 2000);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status) {
            if (error.response.status === 400) {
              signupErrorMessage.value = signupErrorMessages[1];
            } else if (error.response.status === 409) {
              signupErrorMessage.value = signupErrorMessages[0];
            }
            isSignupError.value = true;
          } else {
            console.error(error); // Log other errors
          }
        }
      }
    };

    // Helper type guard to check if `error` is an AxiosError
    function isAxiosError(error: unknown): error is { response: { status: number } } {
      return typeof error === 'object' && error !== null && 'response' in error;
    }

    const redirectToLogin = () => {
      router.push('/');
    };

    return {
      form,
      formModel,
      rules,
      handleSubmit,
      redirectToLogin,
      signupErrorMessage,
      isSignupError,
      showSplashScreen
    };
  }
};
</script>

<style scoped>
.signup-container {
  width: 40%;
  margin: 0 auto;
  margin-top: 9%;
}

.error-popup {
  padding: 20px;
  text-align: center;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-top: 10px;
}

.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
}
</style>

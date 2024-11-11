<template>
  <div class="connexion-container">
    <div>
      <h1>Connect to access Alina</h1>
    </div>
    <q-form ref="form" :model="formModel" :rules="rules">
      <q-form-item label="Username" prop="name">
        <q-input v-model="formModel.name" type="text" />
      </q-form-item>

      <q-form-item label="Password" prop="password">
        <q-input v-model="formModel.password" type="password" />
      </q-form-item>

      <q-button @click="handleSubmitClick">Login</q-button>
      <q-button @click="handleResetClick" theme="secondary">Sign up</q-button>
    </q-form>
  </div>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue';

const model = {
  name: '',
  password: ''
};

const defaultRules = {
  name: {
    required: true,
    message: 'Please type username',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'Please type password',
    trigger: 'blur'
  }
};

export default defineComponent({
  name: 'Connexion',
  setup() {
    const form = ref(null);
    const formModel = reactive(model);
    const rules = reactive(defaultRules);

    const handleSubmitClick = async () => {
      const valid = await form?.value?.validate();
      if (valid) {
        const { isValid, invalidFields } = valid;
        console.log('QForm | validate', isValid, invalidFields);
        if (isValid) {
          alert('Success');
        }
      }
    };

    const handleResetClick = () => {
      form?.value?.resetFields();
    };

    return {
      form,
      formModel,
      rules,
      handleSubmitClick,
      handleResetClick,
    };
  }
});
</script>

<style scoped>
.connexion-container {
  width: 30%;
  margin: 10% auto 0;
}
</style>

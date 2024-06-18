<template>
  <div class="flex-center">
    <btn-app text="Pay" @click="pay()" />
  </div>
</template>

<script setup>
import { ChargilyClient } from '@chargily/chargily-pay';

const client = new ChargilyClient({
  api_key: 'test_pk_oAdq63OLjEmHdB5xMI5fulbvI5FdymGsBdZGDHeG',
  mode: 'test', // Change to 'live' when deploying your application
});

const pay = async () => {
  console.log('start');
  try {
    const  checkout = await client.createCheckout({
      items: [
        {
          price: '01hyvfk700tnc7wcyatkzrjj5r',
          quantity: 1,
        },
      ],
      success_url: 'https://api.proecole.com/v1/payment/success',
      failure_url: 'https://api.proecole.com/v1/payment/failure',
      payment_method: 'edahabia', // Optional, defaults to 'edahabia'
      locale: 'ar', // Optional, defaults to 'ar'
      pass_fees_to_customer: true, // Optional, defaults to false
      shipping_address: '123 Test St, Test City, DZ', // Optional
      collect_shipping_address: true, // Optional, defaults to false
      metadata: {
        order_id: '123456',
      },
    });
    console.log(checkout);
  } catch (error) {
    console.log(error);
  }
  console.log('end');
}
</script>
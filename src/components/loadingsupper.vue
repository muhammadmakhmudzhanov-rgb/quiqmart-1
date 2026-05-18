<template>
<div class="mp-loader"></div>



</template>
<style>
.mp-loader {
  width: 70px;
  height: 70px;
  border-radius: 50%;

  border: 5px solid #e5e7eb;
  border-top: 5px solid #6366f1;

  animation: spin 0.8s linear infinite;

  margin: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.mp-loader {
  width: 70px;
  height: 70px;
  border-radius: 50%;

  background: conic-gradient(
    #6366f1,
    #a5b4fc,
    #e0e7ff,
    #6366f1
  );

  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 5px),
    #000 0
  );

  animation: spin 1s linear infinite;
}
</style>
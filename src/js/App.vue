<template>
  <div class="wwt-app">
    <WorldWideTelescope wwt-namespace="mywwt" v-if="show"></WorldWideTelescope>
    <p class="coord-overlay">{{ coordText }}</p>
  </div>
</template>

<script>
import {fmtDegLat, fmtHours} from "@wwtelescope/astro";
import {WWTAwareComponent} from "@wwtelescope/engine-pinia";

export default {
  extends: WWTAwareComponent,
  data() {
    return {
      show: false
    }
  },
  computed: {
    coordText() {
      return `${fmtHours(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
    }
  },
  mounted() {
    setTimeout(() => {
      this.show = true;
    }, 1000);
  }
};
</script>

<style>
.wwt-app .wwtelescope-component {
	 width: 600px;
	 height: 400px;
	 margin: 0;
	 padding: 0;
}
 .wwt-app .coord-overlay {
	 position: absolute;
	 top: 1rem;
	 left: 1rem;
	 color: #fff;
}
</style>
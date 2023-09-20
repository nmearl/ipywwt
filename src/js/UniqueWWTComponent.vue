<template>
  <div :id="customId" class="wwtelescope-component"></div>
</template>

<script>
import { WWTComponent } from "@wwtelescope/engine-pinia";
import { v4 as uuidv4 } from 'uuid';

export default {
  extends: WWTComponent,
  data() {
    return {
      customId: `${uuidv4()}`
    }
  },
};
</script>
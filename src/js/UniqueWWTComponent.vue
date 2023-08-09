<template>
  <div :id="uniqueId" class="wwtelescope-component"></div>
</template>

<script>
import { WWTComponent } from "@wwtelescope/engine-pinia";
import { v4 as uuidv4 } from 'uuid';

export default {
  extends: WWTComponent,
  // data() {
  //   return {
  //     uniqueId: `${uuidv4()}`,
  //     wwt: undefined,
  //     renderLoopId: undefined
  //   }
  // },
  created() {
    console.log("Created")
    // Create a globally unique ID for the div that the WWT engine can latch onto.
    const uid = `${uuidv4()}`;
    // const uid = `wwtcmpt${idCounter}`;
    Object.defineProperties(this, {
      uniqueId: { get() { return uid; } },
    });
    // this.uniqueId = uid;
    // idCounter += 1;
  }
};
</script>
<template>
  <div class="search-tools">
    <input v-model="search" type="search" placeholder="rechercher">
    <select v-model="selectedCategory">
      <option value="tous">
        tous
      </option>
      <option
        v-for="category in props.categories"
        :key="category"
        :value="category"
      >
        {{ category }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: string[]
}>()

const search = defineModel('search')
const selectedCategory = defineModel('selectedCategory')
</script>

<style scoped>
.search-tools {
  select {
    color: #0e1e24;
    font-weight: bold;
    text-transform: capitalize;
    height: 60px;
    width: 200px;
    background: white;
    border: 2px solid white;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 5px;
    margin-left: 20px;
    box-sizing: border-box;

    &:hover,
    &:focus {
      outline: none;
      border: 2px solid #0e1e24;
      cursor: pointer;
    }
  }

  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    height: 24px;
    width: 24px;
    margin-left: .4em;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23777'><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/></svg>");
    cursor: pointer;
  }

  input {
    margin-right: 20px;
    color: #0e1e24;
    font-weight: bold;
    text-transform: capitalize;
    height: 60px;
    width: 200px;
    background: white;
    border: 2px solid white;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 5px;
    box-sizing: border-box;

    &:hover,
    &:focus {
      outline: none;
      border: 2px solid #0e1e24;
      cursor: text;
    }
  }
}
</style>

<template>
  <div class="wrapper">
    <el-input class="mb10" type="textarea" v-model="state.url" :autosize="{ minRows: 1, maxRows: 2 }" placeholder="URL" @keyup.enter="goUpdate"></el-input>
    <div class="overflow-box">
      <el-select class="mb10" v-model="state.protocol" placeholder="Protocol" @change="formatUrl" style="width: 100px">
        <el-option label="http" value="http"></el-option>
        <el-option label="https" value="https"></el-option>
      </el-select>
      <el-input class="mb10" v-model="state.hostname" placeholder="Hostname" @input="formatUrl" style="width: 400px"></el-input>
      <el-input class="mb10" v-model="state.port" placeholder="Port" @input="formatUrl" style="width: 100px"></el-input>
      <el-input class="mb10" v-model="state.pathname" placeholder="Pathname" @input="formatUrl" ></el-input>
      <el-input class="mb10"  v-model="state.hash" placeholder="#Hash" @input="formatUrl"></el-input>
      <el-input type="textarea" v-model="state.searchParams" :autosize="{ minRows: 2, maxRows: 20 }" placeholder="SearchParams" @input="formatUrl"></el-input>
    </div>
    <div class="btn-group">
      <el-button class="main-button" @click="goUpdate">刷新</el-button>
      <el-button class="default-button" @click="goCreate">新页面</el-button>
      <el-button class="default-button" @click="goNewWindow(false)">新窗口</el-button>
      <el-button class="default-button" @click="goNewWindow(true)">无痕模式</el-button>
      <span class="copyright">&copy;Tozlam</span>
    </div>

  </div>
</template>
<script setup>
import {reactive, ref} from "vue";

const state = reactive({
  url: '',
  protocol: '',
  hostname: '',
  port: '',
  pathname: '',
  hash: '',
  searchParams: ''
})

const goNewWindow = (bool) => {
  chrome.windows.create({url: state.url, incognito: bool})
}

const goUpdate = () => {
  chrome.tabs.update({ url: state.url });
}

const goCreate = () => {
  chrome.tabs.create({ url: state.url });
}

const getData = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = new URL(tabs[0].url);
    state.protocol = url.protocol
    state.hostname = url.hostname
    state.port = url.port
    state.pathname = url.pathname
    state.hash = url.hash

    let searchResult = queryParams(url, true)
    state.searchParams = searchResult.join('\n')

    if (state.hash) {
      state.hash = getHash(tabs[0].url)
    }

    formatUrl()
  })
}

const getHash = (href) => {
  const [,hash] = href.split('#')
  if (hash.match(/\?/)){
    const hashBefore = hash.split('?')
    return hashBefore[0]
  }
  return hash
}


const queryParams = (href, needDecode = true) => {
  const reg = /([^&=]+)=([\w\W]*?)(&|$|#)/g
  const { search, hash } = new URL(href);
  const args = [search, hash];
  let searchResult = []
  for (let i = 0; i < args.length; i++) {
    const str = args[i];
    if (str) {
      const s = str.replace(/#|\//g, '')
      const arr = s.split('?')
      if (arr.length > 1) {

        for (let i = 1; i < arr.length; i++) {
          let res;
          while ((res = reg.exec(arr[i]))) {
            searchResult.push(`${res[1]}=${needDecode ? decodeURIComponent(res[2]) : res[2]}`)
          }
        }
      }
    }
  }
  return searchResult;
}

const formatUrl = () => {
  let pathname = ''
  if (state.pathname) {
    if (!state.pathname.match(/^\//)) {
      pathname = '/' + state.pathname
    } else {
      pathname = state.pathname
    }
  }

  let hash = ''
  if (state.hash) {
    if (!state.hash.match(/^\#/)) {
      hash = '#' + state.hash
    } else {
      hash = state.hash
    }
  }

  state.url = `${state.protocol}//${state.hostname}` + (state.port ? `:${state.port}` : '') + pathname
  + hash + (state.searchParams ? '?' + state.searchParams.split('\n').join('&') : '')
}

getData()

</script>
<style>
.wrapper{
  width: 600px;
}
.overflow-box {
  padding-bottom: 50px;
  max-height: 450px;
  overflow: auto;
}
.btn-group {
  width: 100%;
  position: fixed;
  bottom: 0;
  background: #fff;
  padding: 10px 0;
}
.copyright {
  position: relative;
  bottom: 0px;
  left: 210px;
  color: #666;
}
.mb10 {
  margin-bottom: 10px;
}
.main-button {
  color: #fff;
  background: #83af9b;
}
.default-button:hover, .main-button:hover{
  border-color: #83af9b;
  color: #83af9b;
}
.el-input, .el-textarea {
  --el-input-focus-border-color: #83af9b;
}
.el-select{
  --el-select-input-focus-border-color: #83af9b;
}
</style>

<template>
  <div
    style="
      padding: 0px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
    "
  >
    <h1 color="$ep-color-primary">{{ msg }}</h1>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="Access Key">
        <el-input v-model="form.ak" placeholder="输入百度云Access Key" />
      </el-form-item>
      <el-form-item label="Secret Key">
        <el-input type="password" placeholder="输入百度云Secret Key" show-password v-model="form.sk" />
      </el-form-item>
      <el-form-item label="区域">
        <el-select v-model="form.region" placeholder="please select your zone">
          <el-option label="华北-北京" value="bj" />
          <el-option label="华北-保定" value="bd" />
          <el-option label="华北-阳泉" value="yq" />
          <el-option label="华南-广州" value="gz" />
          <el-option label="华东-苏州" value="su" />
          <el-option label="华中-武汉" value="fwh" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="Activity time">
        <el-col :span="11">
          <el-date-picker
            v-model="form.date1"
            type="date"
            placeholder="Pick a date"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="2" class="text-center">
          <span class="text-gray-500">-</span>
        </el-col>
        <el-col :span="11">
          <el-time-picker
            v-model="form.date2"
            placeholder="Pick a time"
            style="width: 100%"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="Instant delivery">
        <el-switch v-model="form.delivery" />
      </el-form-item>
      <el-form-item label="Activity type">
        <el-checkbox-group v-model="form.type">
          <el-checkbox value="Online activities" name="type">
            Online activities
          </el-checkbox>
          <el-checkbox value="Promotion activities" name="type">
            Promotion activities
          </el-checkbox>
          <el-checkbox value="Offline activities" name="type">
            Offline activities
          </el-checkbox>
          <el-checkbox value="Simple brand exposure" name="type">
            Simple brand exposure
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="Resources">
        <el-radio-group v-model="form.resource">
          <el-radio value="Sponsor">Sponsor</el-radio>
          <el-radio value="Venue">Venue</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Activity form">
        <el-input v-model="form.desc" type="textarea" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onReset">清除</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  delAccessToken,
  // getAccessToken,
  setAccessToken,
  getAkSk,
} from "../utils/auth";

const msg = "系统设置";
// do not use same name with ref
const form = reactive({
  name: "",
  ak: "",
  sk: "",
  region: "bj",
  date1: "",
  date2: "",
  delivery: false,
  type: [],
  resource: "",
  desc: "",
});

const { ak, sk, region } = getAkSk();
form.ak = ak;
form.sk = sk;
form.region = region || 'bj';

const onSubmit = () => {
  console.log("submit!", form.ak, form.sk, form.region);
  // 保存到localStorage
  if (!form.ak || !form.sk || !form.region) {
    ElMessage.warning("ak, sk, region is required");
    return;
  } else {
    setAccessToken(`${form.ak}|${form.sk}|${form.region}`);
    ElMessage.success("保存成功");
  }
};

const onReset = () => {
  form.ak = "";
  form.sk = "";
  form.region = "bj";
  delAccessToken();
  ElMessage.success("清除成功");
};
</script>

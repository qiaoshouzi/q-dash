<template>
  <n-card title="Access" size="small" content-style="padding: 0">
    <template #header-extra>
      <n-button size="small" strong secondary type="primary" @click="accessRegistration">
        注册
      </n-button>
    </template>
    <n-data-table :columns="tableColumns" :data="tableData" :bordered="false" />
  </n-card>
  <n-modal
    :show="tableSelectData !== undefined"
    @update:show="
      (v) => {
        if (v === false) tableSelectData = undefined;
      }
    "
    preset="card"
    style="width: 600px"
    title="编辑WebAuth"
  >
    <n-input
      type="text"
      clearable
      :value="tableSelectData?.name"
      @update:value="(v) => ((tableSelectData as any).name = v)"
    />
    <div style="margin-top: 5px; display: flex; justify-content: flex-end; gap: 5px">
      <n-button tertiary @click="tableSelectData = undefined">取消</n-button>
      <n-button tertiary type="success" @click="saveEditButtonClick">保存</n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { startRegistration } from "@simplewebauthn/browser";
import { NCard, NInput, NButton, NDataTable, NModal, type DataTableColumns } from "naive-ui";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/typescript-types";

import API from "@/assets/API";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const tableSelectData = ref<
  PasskeyData & {
    edit: (name: string) => void;
  }
>();
type PasskeyData = {
  id: string;
  name: string;
  rpID: string;
};
const tableColumns: DataTableColumns<PasskeyData> = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "rpID",
    key: "rpID",
    width: "120",
  },
  {
    title: "Action",
    key: "actions",
    width: "141",
    render(row) {
      return h(
        "div",
        {
          style: {
            display: "flex",
            gap: "5px",
          },
        },
        [
          h(
            NButton,
            {
              tertiary: true,
              type: "warning",
              onClick: () => {
                tableSelectData.value = {
                  ...JSON.parse(JSON.stringify(row)),
                  edit(name) {
                    row.name = name;
                  },
                };
              },
            },
            { default: () => "编辑" }
          ),
          h(
            NButton,
            {
              tertiary: true,
              type: "error",
              onClick: () => {
                NaiveUIDiscreteAPI.dialog.warning({
                  title: "警告",
                  content: `你确定要删除 ${row.name} 吗?`,
                  positiveText: "确定",
                  negativeText: "不确定",
                  onPositiveClick: async () => {
                    const resp_json = await API(
                      `删除Access(${row.name})`,
                      "/api/access/authenticator",
                      "DELETE",
                      {
                        param: {
                          id: row.id,
                        },
                      }
                    );
                    if (!resp_json) return;

                    tableData.value = tableData.value.filter((v) => !(v.id === row.id));
                  },
                });
              },
            },
            { default: () => "删除" }
          ),
        ]
      );
    },
  },
];
const tableData = ref<PasskeyData[]>([]);
const initTableData = async () => {
  const resp_json = await API<
    {
      name: string;
      id: string;
      rpID: string;
    }[]
  >("获取Access", "/api/access/authenticator", "GET");
  if (!resp_json) return;
  tableData.value = resp_json.data;
};
initTableData();

const saveEditButtonClick = async () => {
  if (tableSelectData.value === undefined) return;

  const resp_json = await API(
    `编辑Access(${tableColumns.values.name})`,
    "/api/access/authenticator",
    "POST",
    {
      body: {
        id: tableSelectData.value.id,
        name: tableSelectData.value.name,
      },
    }
  );
  if (!resp_json) return;

  tableSelectData.value.edit(tableSelectData.value.name);
  tableSelectData.value = undefined;
};
const accessRegistration = async () => {
  const resp = await API<PublicKeyCredentialCreationOptionsJSON>(
    "Access获取注册Options",
    "/api/access/registration/options",
    "POST",
    {
      body: {
        rpID: location.hostname,
        userName: "qiaoshouzi",
      },
    }
  );
  if (!resp) return;

  const browserResponse = await startRegistration(resp.data).catch((e) => {
    console.error(e);
    NaiveUIDiscreteAPI.notification.error({
      title: "Registration: WebAuth Error",
      content: `${e.name}: ${e.message}`,
      duration: 3500,
      keepAliveOnHover: true,
    });
    return null;
  });
  if (!browserResponse) return;

  const verificationResp = await API<{
    id: string;
    name: string;
    rpID: string;
  }>("Access保存注册信息", "/api/access/registration/verification", "POST", {
    body: {
      browserResponse,
      rpID: location.hostname,
      userName: "qiaoshouzi",
      expectedChallenge: resp.data.challenge,
    },
  });
  if (verificationResp) {
    tableData.value.push(verificationResp.data);
  }
};
</script>

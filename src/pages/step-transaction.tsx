/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBackEndUrl } from "@/constant";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Select, Steps, Tag } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";

interface Props {
  onCancel?: () => void;
  data: any;
}
const StepTransaction: FC<Props> = ({ onCancel, data }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [isOpt, setIsOtp] = useState(false);
  const [otp,setOtp] = useState()
  const backEndUrl = getBackEndUrl();
  const [errMess, setErrMess] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [dataSubmit, setDataSubmit] = useState({
    transaction_type: "tranfer",
    account: data.bank_card.code,
    bank_name: undefined,
    account_number: undefined,
    value: undefined,
    postage: "Nguoi chuyen tra",
    note: undefined,
  });

  const steps: any = [
    {
      title: "First",
      content: (
        <Step1
          initData={dataSubmit}
          form={form}
          getData={(value: any) =>
            setDataSubmit((prev) => ({ ...prev, ...value }))
          }
        />
      ),
    },
    {
      title: "Second",
      content: (
        <Step2
          form={form}
          initData={dataSubmit}
          getData={(value: any) =>
            setDataSubmit((prev) => ({ ...prev, ...value }))
          }
        />
      ),
    },
    {
      title: "Last",
      content: <Step3 data={dataSubmit} />,
    },
  ];
  const items = steps.map((item: any) => ({
    key: item.title,
    title: item.title,
  }));
  const next = async () => {
    const validate = await form.validateFields();
    if (validate) {
      setCurrent(current + 1);
    }
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const transaction = async () => {
    setLoading(true);
    try {
      if(!isOpt){
        const res = await axios.post(
          `${backEndUrl}/api/transaction`,
          dataSubmit,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsOtp(res.data.data.has_otp);
        if (!res.data.data.has_otp) {
          setCurrent(0);
          setDataSubmit({
            transaction_type: "tranfer",
            account: data.bank_card.code,
            bank_name: undefined,
            account_number: undefined,
            value: undefined,
            postage: "Nguoi chuyen tra",
            note: undefined,
          });
        }
      }else{
        const res = axios.post(
          `${backEndUrl}/api/check-otp-transaction`,
          {...dataSubmit,otp_code:otp},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Steps current={current} items={items} />
      <div className="pt-6 min-h-[20rem]">
        {steps[current].content}
        <div className=" max-w-[600px] mx-auto mt-4">
          {Object.keys(steps).length - 1 === current && isOpt ? (
            <Form layout="vertical" className="">
              <p className="my-2">Vui lòng nhập mã otp được gửi qua email để xác nhận thanh toán</p>
              <div className="flex gap-2 items-center">
                <Form.Item
                  className="!mb-4 w-full"
                  name="otp_code"
                >
                  <Input onChange={(e:any)=>setOtp(e.target.value)}></Input>
                </Form.Item>
                <Button title="Gửi lại mã" icon={<ReloadOutlined />} className="mb-4"/>
              </div>
            </Form>
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-2 justify-end">
        <Button type="primary" onClick={() => next()}>
          Huỷ
        </Button>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Tiếp theo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button loading={loading} type="primary" onClick={() => transaction()}>
            Xác nhận
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Quay lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepTransaction;

const Step1: FC<{
  getData: (value: any) => void;
  initData: any;
  form: any;
}> = ({ getData, initData, form }) => {
  useEffect(() => {
    form.setFieldsValue(initData);
  }, []);

  return (
    <>
      <Form layout="vertical" form={form}>
        <Form.Item
          className="!mb-4"
          name="transaction_type"
          label="Loại thanh toán"
        >
          <Select
            onChange={(value) => {
              getData({ transaction_type: value });
            }}
            options={[
              { label: "Chuyển tiền", value: "tranfer" },
              { label: "Thanh toán tiền điện", value: "utilities" },
              { label: "Mua sắm", value: "shopping" },
              { label: "Mua thẻ điện thoại", value: "phone_recharge" },
              { label: "Đóng bảo hiểm", value: "insurance" },
              { label: "Gửi tiết kiệm", value: "savings" },
              { label: "Đóng học phí", value: "learn" },
            ]}
          ></Select>
        </Form.Item>
        <Form.Item
          className="!mb-4"
          name="bank_name"
          label="Ngân hàng"
          rules={
            initData.transaction_type === "tranfer"
              ? [
                  {
                    required: true,
                    message: "Vui lòng chọn ngân hàng để tiếp tục",
                  },
                ]
              : undefined
          }
        >
          <Select
            disabled={initData.transaction_type !== "tranfer"}
            placeholder="Chọn ngân hàng"
            onChange={(value) => {
              getData({ bank_name: value });
            }}
            options={[
              { label: "AGRIBANK", value: "AGRIBANK" },
              { label: "BIDV", value: "BIDV" },
              { label: "VIETINBANK", value: "VIETINBANK" },
              { label: "VIETCOMBANK", value: "VIETCOMBANK" },
              { label: "TPBANK", value: "TPBANK" },
            ]}
          ></Select>
        </Form.Item>
      </Form>
    </>
  );
};
const Step2: FC<{
  getData: (value: any) => void;
  initData: any;
  form: any;
}> = ({ getData, initData, form }) => {
  useEffect(() => {
    form.setFieldsValue(initData);
  }, []);
  return (
    <>
      <Form form={form} layout="vertical">
        <Form.Item
          className="!mb-4"
          name="account_number"
          label="Số tài khoản"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số tài khoản để tiếp tục",
            },
          ]}
        >
          <Input
            type="number"
            onChange={(e) => {
              getData({ account_number: e.target.value });
            }}
            className="w-full"
            placeholder="Nhập số tài khoản hưởng thụ"
          ></Input>
        </Form.Item>
        <Form.Item
          className="!mb-4"
          name="value"
          label="Số tiền"
          rules={[
            { required: true, message: "Vui lòng nhập số tiền để tiếp tục" },
          ]}
        >
          <InputNumber
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            min={1000}
            onChange={(value) => {
              getData({ value: value });
            }}
            placeholder="Nhập số tiền cần chuyển"
            className="w-full"
          ></InputNumber>
        </Form.Item>
        <Form.Item className="!mb-4" name="postage" label="Phí giao dịch">
          <Select
            onChange={(e) => {
              getData({ postage: e.target.value });
            }}
            options={[
              { label: "Người chuyển trả", value: "Nguoi chuyen tra" },
              { label: "Người nhận trả", value: "Nguoi nhan tra" },
            ]}
          ></Select>
        </Form.Item>
        <Form.Item className="!mb-4" name="note" label="Ghi chú">
          <Input.TextArea
            rows={1}
            onChange={(e) => {
              getData({ note: e.target.value });
            }}
          ></Input.TextArea>
        </Form.Item>
      </Form>
    </>
  );
};
const Step3: FC<{ data: any }> = ({ data }) => {
  if (!data) return <></>;
  const name: any = {
    transaction_type: "Loại giao dịch",
    account: "Tài khoản nguồn",
    bank_name: "Đến ngân hàng",
    account_number: "Đến số tài khoản",
    value: "Số tiền",
    postage: "Phí giao dịch",
    note: "Ghi chú",
  };
  const transaction_type_item: any = {
    tranfer: "Chuyển tiền",
    utilities: "Thanh toán tiền điện",
    shopping: "Mua sắm",
    phone_recharge: "Mua thẻ điện thoại",
    insurance: "Đóng bảo hiểm",
    savings: "Gửi tiết kiệm",
    learn: "Đóng học phí",
  };
  const postage_item: any = {
    "Nguoi chuyen tra": "Người chuyển trả",
    "Nguoi nhan tra": "Người nhận trả",
  };
  return (
    <div className=" flex flex-col gap-4 border-[1px] border-[#bdbdbd] p-4 rounded-lg max-w-[600px] mx-auto">
      {Object.keys(data).map((key: any) => {
        if (key === "postage") {
          return (
            <div className="">
              <span>{name[key]}</span>: <span>{postage_item[data[key]]}</span>
            </div>
          );
        }
        if (key === "value") {
          return (
            <div className="">
              <span>{name[key]}</span>:{" "}
              <span>
                {Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(data.value)}
              </span>
            </div>
          );
        }
        if (key === "transaction_type") {
          return (
            <div className="">
              <span>{name[key]}</span>:{" "}
              <span>{transaction_type_item[data[key]]}</span>
            </div>
          );
        } else {
          return (
            <div className="">
              <span>{name[key]}</span>: <span>{data[key]}</span>
            </div>
          );
        }
      })}
    </div>
  );
};

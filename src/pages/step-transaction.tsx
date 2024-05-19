/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBackEndUrl } from "@/constant";
import { ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Steps,
  Tag,
  notification,
} from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { deburr } from "lodash";
interface Props {
  onCancel: () => void;
  data: any;
  onSuccess?:()=>void
}
const StepTransaction: FC<Props> = ({ onCancel, data,onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [isOpt, setIsOtp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState();
  const [pinCode, setPinCode] = useState<any>();
  const backEndUrl = getBackEndUrl();
  const [loadingSent, setLoadingSent] = useState(false);
  const [count, setCount] = useState(0);
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
  const newTran = () => {
    setCurrent(0);
    setIsSuccess(false);
    setIsOtp(false);
    setDataSubmit({
      transaction_type: "tranfer",
      account: data.bank_card.code,
      bank_name: undefined,
      account_number: undefined,
      value: undefined,
      postage: "Nguoi chuyen tra",
      note: undefined,
    });
  };
  const transaction = async () => {
    setLoading(true);
    try {
      if (!isOpt) {
        const res = await axios.post(
          `${backEndUrl}/api/transaction`,
          { ...dataSubmit, pin_code: pinCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsOtp(res.data.data.has_otp);

        if (!res.data.data.has_otp) {
          setIsSuccess(true);
          onSuccess&&onSuccess()
          api.success({
            message: "Thành công",
            description: "Giao dịch thành công",
          });
        } else {
          setCount(60);
        }
      } else {
        await axios.post(
          `${backEndUrl}/api/check-otp-transaction`,
          { ...dataSubmit, otp_code: otp, pin_code: pinCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        api.success({
          message: "Thành công",
          description: "Giao dịch thành công",
        });
        onSuccess&&onSuccess()
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.log(error);
      api.error({
        message: "Thất bại",
        description: error.response.data.message
          ? error.response.data.message
          : "Giao dịch thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const sentOtp = async () => {
    const dataSubmit = form.getFieldsValue();
    setLoadingSent(true);
    try {
      await axios.post(`${backEndUrl}/api/sent-otp-tran`, dataSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCount(60);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoadingSent(false);
    }
  };
  useEffect(() => {
    if (count > 0) {
      setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    }
  }, [count]);
  return (
    <Card>
      {contextHolder}
      <Steps current={current} items={items} />
      <div className="pt-6 min-h-[20rem]">
        {steps[current].content}
        <div className=" max-w-[600px] mx-auto mt-4">
          {Object.keys(steps).length - 1 === current && !isSuccess ? (
            <Form layout="vertical" className="">
              <Form.Item
                label="Mã pin giao dịch"
                name="pin_code"
                className="w-[300px]"
                rules={[
                  { required: true, message: "Vui lòng nhập mã pin giao dịch" },
                ]}
              >
                <Input.Password
                  className="w-full"
                  onChange={(e) => {
                    setPinCode(e.target.value);
                  }}
                ></Input.Password>
              </Form.Item>
              {isOpt && (
                <>
                  <p className="my-2">
                    Vui lòng nhập mã otp được gửi qua email để xác nhận thanh
                    toán
                  </p>
                  <div className="flex gap-2 items-center">
                    <Form.Item
                      className="!mb-4 w-full"
                      name="otp_code"
                    >
                      <Input
                        suffix={
                          count > 0 ? (
                            <Tag className="!mr-0" bordered={false}>
                              {count}
                            </Tag>
                          ) : (
                            <></>
                          )
                        }
                        onChange={(e: any) => setOtp(e.target.value)}
                      ></Input>
                    </Form.Item>
                    <Button
                      title="Gửi lại mã"
                      icon={<ReloadOutlined />}
                      disabled={count > 0}
                      loading={loadingSent}
                      className="mb-4"
                      onClick={sentOtp}
                    />
                  </div>
                </>
              )}
            </Form>
          ) : (
            <></>
          )}
        </div>
      </div>
      <>
        {isSuccess ? (
          <div className="mt-8 flex gap-2 justify-end">
            <Button onClick={onCancel}>Quay lại trang chủ</Button>
            <Button onClick={newTran}>Tạo giao dịch mới</Button>
          </div>
        ) : (
          <div className="mt-8 flex gap-2 justify-end">
            <Button danger onClick={onCancel}>
              Huỷ
            </Button>
            {current > 0 && (
              <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                Quay lại
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Tiếp theo
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                loading={loading}
                type="primary"
                onClick={() => transaction()}
              >
                Xác nhận
              </Button>
            )}
          </div>
        )}
      </>
    </Card>
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
              { label: "Mua sắm trực tuyến", value: "shopping" },
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
          rules={
            initData.transaction_type === "tranfer"
              ? [
                  {
                    required: true,
                    message: "Vui lòng nhập số tài khoản để tiếp tục",
                  },
                ]
              : undefined
          }
        >
          <Input
            disabled={initData.transaction_type !== "tranfer"}
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
        <Form.Item className="!mb-4" name="note" label="Nội dung">
          <Input.TextArea
            rows={1}
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputWithoutAccents = deburr(inputValue);
              getData({ note: inputWithoutAccents });
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
    shopping: "Mua sắm trực tuyến",
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
            <>
              {postage_item[data[key]] ? (
                <div className="">
                  <span>{name[key]}</span>:{" "}
                  <span>{postage_item[data[key]]}</span>
                </div>
              ) : (
                <></>
              )}
            </>
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
            <>
              {data[key] ? (
                <div className="">
                  <span>{name[key]}</span>: <span>{data[key]}</span>
                </div>
              ) : (
                <></>
              )}
            </>
          );
        }
      })}
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBackEndUrl } from "@/constant";
import { handleError } from "@/constant/handle-error";
import { Button, Checkbox, DatePicker, Form, Input, Radio, Select } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  let faceioInstance: any = null;
  const backEndUrl = getBackEndUrl();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isFaceId, setIsFaceId] = useState(false);
  const [occupations,setOccupations] = useState([])
  const [form] = Form.useForm();
  const faceRegistration = useCallback(async () => {
    const dataSubmit = form.getFieldsValue();
    const validate = await form.validateFields();
    if (!validate) {
      return;
    }
    try {
      const fa = await faceioInstance.enroll({
        locale: "auto",
        payload: {
          email: dataSubmit.email,
        },
      });
      await axios.post(`${backEndUrl}/api/register`, {
        ...dataSubmit,
        face_id: fa.facialId,
      });
      form.resetFields();
      navigate("/login");
    } catch (errorCode) {
      console.log(errorCode);
      handleError(errorCode);
    }
  }, [faceioInstance]);
  const createUser = async () => {
    const dataSubmit = form.getFieldsValue();
    setLoading(true);
    const validate = await form.validateFields();
    if (!validate) {
      return;
    }
    try {
      await axios.post(`${backEndUrl}/api/register`, {...dataSubmit,birth_date: dayjs(dataSubmit.birth_date).format('YYYY-MM-DD')});
      navigate("/login");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const getOccupations = async()=>{
    const res = await axios.get(`${backEndUrl}/api/occupations`)
    const data = res.data.data.map((item:any)=>{
      return {
        label: item.name,
        value: item.id
      }
    })
    setOccupations(data)
  }
  useEffect(() => {
    const faceIoScript = document.createElement("script");
    faceIoScript.src = "//cdn.faceio.net/fio.js";
    faceIoScript.async = true;
    faceIoScript.onload = () => faceIoScriptLoaded();
    document.body.appendChild(faceIoScript);


    getOccupations()
    return () => {
      document.body.removeChild(faceIoScript);
    };
  }, []);
  const faceIoScriptLoaded = () => {
    if (faceIO && !faceioInstance) {
      faceioInstance = new faceIO("fioa062a");
    }
  };

  return (
    <div className="w-full h-full flex items-center registed">
      <div className="w-[500px] h-fit border rounded-lg p-4 mx-auto bg-white">
        <h2 className="text-center font-semibold text-[20px]">
          Chào mừng Quý khách đến với dịch vụ đăng ký SmartBanking
        </h2>
        <Form form={form} layout="vertical">
          <Form.Item
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            name="user_name"
            label="Tên"
            className="!mb-4"
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            name="email"
            label="Email"
            className="!mb-4"
          >
            <Input type="email"></Input>
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            hasFeedback
            name="password"
            label="Mật khẩu"
            className="!mb-4"
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            className="!mb-4"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("mật khẩu xác nhận không trùng khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div className="flex gap-2">
            <Form.Item name="occupation_id" label="Nghề nghiệp" className="!mb-4 w-full">
              <Select options={occupations} className="w-full"></Select>
            </Form.Item>
            <Form.Item  name="birth_date" label="Ngày sinh" className="!mb-4 w-full">
              <DatePicker format={'DD/MM/YYYY'} className="w-full"></DatePicker>
            </Form.Item>
          </div>
          <Form.Item initialValue={'1'} label="Giới tính" name='gender'>
            <Radio.Group>
              <Radio value='1'>Nam</Radio>
              <Radio value='0'>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item initialValue={'1'} label="Tình trạng hôn nhân" name='married'>
            <Radio.Group>
              <Radio value='1'>Đã kết hôn</Radio>
              <Radio value='0'>Độc thân</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item className="!mb-4">
            <Checkbox
              defaultChecked={isFaceId}
              onChange={(e) => {
                setIsFaceId(e.target.checked);
              }}
            >
              Đăng ký nhận diện khuôn mặt
            </Checkbox>
          </Form.Item>
          <div className="flex gap-4 w-full">
            <Form.Item className="w-full !mb-0">
              <Button className="w-full" color="error">
                Huỷ
              </Button>
            </Form.Item>
            <Form.Item className="w-full !mb-0">
              <Button
                type="primary"
                className="w-full"
                loading={loading}
                onClick={() => {
                  isFaceId ? faceRegistration() : createUser();
                }}
              >
                Xác nhận
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;

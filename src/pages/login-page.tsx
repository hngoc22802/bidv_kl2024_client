/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleError } from "@/constant/handle-error";
import { setUser } from "@/stores/features/user";
import { Button, Form, Input, Tag } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./styles.scss";
import axios from "axios";
import { getBackEndUrl } from "@/constant";
import { SendOutlined } from "@ant-design/icons";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backEndUrl = getBackEndUrl();
  const [errMess,setErrMess] = useState(undefined)
  const [count, setCount] = useState(0);
  const [loadingSent,setLoadingSent] = useState(false)
  const [loadingLogin,setLoadingLogin] = useState(false)

  let faceioInstance: any = null;
  const [form] = Form.useForm()
  const faceIoScriptLoaded = () => {
    if (faceIO && !faceioInstance) {
      faceioInstance = new faceIO("fioa062a");
    }
  };
  const faceSignIn = async () => {
    try {
      const userData = await faceioInstance.authenticate({
        locale: "auto",
      });
      console.log(userData);
      
      dispatch(setUser(userData.payload.email));
      navigate("/business");
    } catch (errorCode) {
      console.log(errorCode);
      handleError(errorCode);
    }
  };
  useEffect(() => {
    const faceIoScript = document.createElement("script");
    faceIoScript.src = "//cdn.faceio.net/fio.js";
    faceIoScript.async = true;
    faceIoScript.onload = () => faceIoScriptLoaded();
    document.body.appendChild(faceIoScript);
    return () => {
      document.body.removeChild(faceIoScript);
    };
  }, []);
  const sentOtp = async () => {
    const dataSubmit = form.getFieldsValue()
    setLoadingSent(true)
    try {
      await axios.post(`${backEndUrl}/api/send-otp`, dataSubmit);
      setCount(60)
    } catch (error:any) {
      console.log(error);
      setErrMess(error.response.data.message)
    }finally{
      setLoadingSent(false)
    }
  };
  const onFinish = async (value: any) => {
    setLoadingLogin(true)
    try {
      const res = await axios.post(`${backEndUrl}/api/login`, value);
      dispatch(setUser(res.data));
      if(res){
        navigate("/business");
      }
    } catch (error:any) {
      console.log(error);
      setErrMess(error.response.data.message)
    }finally{
      setLoadingLogin(false)
    }
  };
  useEffect(() => {
    if (count > 0) {
      setTimeout(() => {
        setCount((prev) => (prev-1));
      }, 1000);
    }
  }, [count]);
  return (
    <div className="w-full h-full flex items-center login">
      <div className="w-[400px] h-fit border rounded-lg p-4 mx-auto bg-white">
        <h2 className="text-center font-semibold text-[20px]">
          Chào mừng Quý khách đến với SmartBanking
        </h2>

        <ul className="bg-blue-200 rounded-lg p-2 text-[14px] my-2">
          <li className="pb-2">
            Với khách hàng đã có tài khoản SmartBanking: đăng nhập bằng khuôn
            mặt
          </li>
          <li>
            Với khách hàng chưa có tài khoản SmartBanking: đăng kí khuôn mặt
          </li>
        </ul>

        <Form form={form} onFinish={onFinish} layout="vertical"onValuesChange={()=>setErrMess(undefined)}>
          <Form.Item
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
            className="!mb-4"
            name="email"
            label="Email"
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            className="!mb-4"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            name="password"
            label="Mật khẩu"
          >
            <Input.Password></Input.Password>
          </Form.Item>
          <div className="flex gap-2 items-center">
            <Form.Item
              className="!mb-4 w-full"
              name="otp_code"
              label="Mã OTP"
            >
              <Input suffix={count>0?<Tag className="!mr-0" bordered={false}>{count}</Tag>:<></>}></Input>
            </Form.Item>

            <Button
              className="mt-3"
              loading={loadingSent}
              icon={<SendOutlined />}
              onClick={sentOtp}
              disabled={count > 0}
            />
          </div>
          <Form.Item className="!mb-0">
            <Button className="w-full" type="primary" htmlType="submit" loading={loadingLogin}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        {errMess && 
        <p className="text-red-500 text-[12px]">{errMess}</p>
        }
        <Button className="w-fit mt-3 " onClick={faceSignIn}>
          Đăng nhập bằng nhận diện
        </Button>
        <p className="flex justify-center items-center">
          <span>Chưa có tài khoản? </span>
          <Button
            className="inline w-fit px-1"
            type="link"
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

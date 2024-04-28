/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Card, Form } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBackEndUrl } from "@/constant";
import StepTransaction from "./step-transaction";
import { useNavigate } from "react-router-dom";
const MainPage = () => {
  const backEndUrl = getBackEndUrl();

  const [show, setShow] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate()
  const getData = async (params: any) => {
    const res = await axios.post(
      `${backEndUrl}/api/info/${params.user_id}`,
      params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setUserInfo(res.data.data);
  };
  useEffect(() => {
    if (user_id) {
      getData({ user_id: user_id });
    }
  }, [user_id]);
  const logout = async () => {
    await axios.post(
      `${backEndUrl}/api/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.clear();
    navigate('/login')
  };
  const [form] = Form.useForm();
  const handelCancel = () => {
    setShow(false);
    form.resetFields();
  };
  return (
    <div className="p-4 h-full overflow-hidden">
      <header>
        <Card>
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <p>{userInfo?.partner?.name || "Admin"}</p>
                <p>Số tài khoản: {userInfo?.bank_card?.code||''}</p>
                <p>
                  Số dư:{" "}
                  {userInfo.bank_card
                    ? Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(userInfo?.bank_card?.mount||0)
                    : 0}
                </p>
              </div>
            </div>
            <Button onClick={logout}>Đăng xuất</Button>
          </div>
        </Card>
      </header>
      {!show && (
        <div className="mt-4">
          <Button onClick={() => setShow(true)}>Tạo giao dịch</Button>
        </div>
      )}
      {show && (
        <div className="w-[70%] mx-auto pt-4">
          <p className="font-semibold text-[18px] text-center mb-4">
            Chuyển tiền nhanh 24/7
          </p>
          <StepTransaction data={userInfo}/>
        </div>
      )}
    </div>
  );
};

export default MainPage;

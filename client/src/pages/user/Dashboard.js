import React from "react";
import Layout from "../../components/Layout";
import UserMenu from "../../components/UserMenu";
import { useAuth } from "../../context/auth";
const Dashboard = () => {
  const [auth] = useAuth();
  return (
    <Layout title={"Dashboard - Ecommerce App"}>
      <div className="m-3 p-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <div className="card w-75 p-3">
              <h4>Name</h4>
              <h6>{auth?.user?.name ?? "Name not available at the moment."}</h6>
              <hr />
              <h4>Contact</h4>
              <h6>{auth?.user?.phone ?? "Contact not available at the moment."}</h6>
              <hr />
              <h4>Email</h4>
              <h6>{auth?.user?.email ?? "Email not available at the moment."}</h6>
              <hr />
              <h4>Address</h4>
              <h6>{auth?.user?.address ?? "Address not available at the moment."}</h6>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
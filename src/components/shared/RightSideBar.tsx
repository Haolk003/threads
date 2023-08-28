import React from "react";

const RightSideBar = () => {
  return (
    <section className="rightsidebar custom-scrollbar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggest Communities
        </h3>
        <div className="mt-7 flex w-[350px] flex-col gap-9">
          <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>
        </div>
      </div>
    </section>
  );
};

export default RightSideBar;

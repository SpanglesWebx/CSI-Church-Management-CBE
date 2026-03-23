import React from "react";
import moment from "moment";
import ExpenseFormModal from "../Expense/ExpenseFormModal";

const MemberNotificationModel = ({ isOpen, onClose, notification }) => {

  if (!notification) return null;

  return (
    <ExpenseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={notification.heading}
    >

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">

        {notification.items?.map((item, index) => (

          <div
            key={index}
            className="flex justify-between items-start border-b pb-2"
          >

            <p className="text-gray-700 text-sm">
              {item.message}
            </p>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              {moment(item.date).format("DD MMM YYYY")}
            </span>

          </div>

        ))}

      </div>

    </ExpenseFormModal>
  );
};

export default MemberNotificationModel;
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "./Pages/Login";
import ContainerMain from "./Pages/Container";

import FamilyContainer from "./Pages/Family List/Container";
import FamilyList from "./Pages/Family List/List";
import FamilyAddNew from "./Pages/Family List/AddNew";
import AddFamilyPreview from "./Pages/Family List/AddFamilyPreview";

// import MemberContainer from "./Pages/Member List/Container";
// import MemberList from "./Pages/Member List/List";
// import MemberAddNew from "./Pages/Member List/AddNew";
// import MemberPreview from "./Pages/Member List/Preview";
// import MemberEdit from "./Pages/Member List/Edit";

import OfferingList from "./Pages/Offerings/OfferingList";
import MarriageOfferings from "./Pages/Offerings/MarriageOfferings";
import BagOfferType from "./Pages/Offerings/bagOfferType";
import BagOfferList from "./Pages/Offerings/bagOfferingList";

import PasterContainer from "./Pages/Paster/Container";
import PasterNavList from "./Pages/Paster/List";
import PasterPreview from "./Pages/Paster/Preview";
import PasterEdit from "./Pages/Paster/Edit";
import PasterNewFamily from "./Pages/Paster/NewFamily";
import FamilyTable from "./Pages/Paster/familyId list";


import OfferType from "./Pages/Offerings/OfferType";
import Dashboard from "./Pages/Dashboard/Dashboard";
import TreeContainer from "./Pages/Tree/TreeContainer";
import TreePreview from "./Pages/Tree/Preview";
import BirthdayReports from "./Components/Reports/BirthdayReports";
import MarriageReports from "./Components/Reports/Marriage";
import BaptismReports from "./Components/Reports/Baptism";
import CommunionReports from "./Components/Reports/Communion";
import InActiveReports from "./Components/Reports/Inactive";
import RejoiningReports from "./Components/Reports/Rejoining";
import RemindersReports from "./Components/Reports/Reminders";
import ReportsList from "./Pages/ReportsList/ReportsList";
import ReportsPage from "./Pages/ReportsList/ReportsPage";
import AddNewPastorFam from "./Pages/Paster/AddNewPastorFam";
import BillsPages from "./Pages/Bills/BillsPages";
import BillPreview from "./Pages/Bills/BillPreview";
import Auction from "./Components/Offerings/Auction/Auction";
import { DashSundayschool } from "./Pages/Sunday School/DashSundayschool";
import { ClassSunday } from "./Pages/Sunday School/ClassSunday";
import { SundaySclOfferings } from "./Pages/Sunday School/SundaySclOfferings"
import { Teacher } from "./Pages/Sunday School/Teacher"
import { Student } from "./Pages/Sunday School/Student";
import { Event } from "./Pages/Sunday School/Event";
import { Studentauction } from "./Pages/Sunday School/Studentauction";

import { Dashendschool } from "./Pages/Endevour/Dashendschool";
import { Classend } from "./Pages/Endevour/Classend"
import { Teacherend } from "./Pages/Endevour/Teacherend"
import { Studentend } from "./Pages/Endevour/Studentend"
import { Eventend } from "./Pages/Endevour/Eventend"
import { Studentauctionend } from "./Pages/Endevour/Studentauctionend"
import { EndSclOfferings } from "./Pages/Endevour/EndSclOfferings"
import { AuctionReport } from "./Components/Reports/AuctionReport";
import { StudentAucReport } from "./Pages/Sunday School/StudentAucReport";
import { EndeavourAucReport } from "./Pages/Endevour/EndeavourAucReport";
import { MenMembers } from "./Pages/Men Fellowship/MenMembers";
import { MenFellowEvent } from "./Pages/Men Fellowship/MenFellowEvent";
import { WomenMember } from "./Pages/Women Fellowship/WomenMember";
import { WomenFellowEvent } from "./Pages/Women Fellowship/WomenFellowEvent";
import { AddHarvestItem } from "./Pages/Harvest Auction/AddHarvestItem";
import { HarvestAuction } from "./Pages/Harvest Auction/HarvestAuction";
import { HarvestAucReport } from "./Pages/Harvest Auction/HarvestAucReport";
import { Subscribers } from "./Pages/Subscription/Subscribers";
import { AddSubscription } from "./Pages/Subscription/AddSubscription";
import { SubscriberDetails } from "./Pages/Subscription/SubscriberDetails";
import { YouthList } from "./Pages/Youth/YouthList";
import { CoupleList } from "./Pages/Couple/CoupleList";
import { Usercontrol } from "./Pages/User Controll/Usercontrol";
import { MemberDash } from "./Pages/Member Login/MemberDash";
import { MemberPayments } from "./Pages/Member Login/MemberPayments";
import { MemberDetails } from "./Pages/Member Login/MemberDetails";
import { MenActivities } from "./Pages/Men Fellowship/MenActivities";
import { WomenActivities } from "./Pages/Women Fellowship/WomenActivities";
import { PastorDashboard } from "./Pages/Pastor Login/PastorDashboard";
import { ServiceActivities } from "./Pages/Pastor Login/ServiceActivities";
import { TreasurerDash } from "./Components/RoleBasedDashes/TreasurerDash";
import { AccountantDash } from "./Components/RoleBasedDashes/AccountantDash";
import { SecretaryDash } from "./Components/RoleBasedDashes/SecretaryDash";
import { SundaySclAccDash } from "./Components/RoleBasedDashes/SundaySclAccDash";
import { ChurchOfficeWorkerDash } from "./Components/RoleBasedDashes/ChurchOfficeWorkerDash";
import { EndeavourTeachDash } from "./Pages/Endeavour Teacher Login/EndeavourTeachDash";
import { EndeavourStudents } from "./Pages/Endeavour Teacher Login/EndeavourStudents";
import { EndeavourEvent } from "./Pages/Endeavour Teacher Login/EndeavourEvent";
import { EndeavourAuction } from "./Pages/Endeavour Teacher Login/EndeavourAuction";
import { EndevaourAucReportforTeach } from "./Pages/Endeavour Teacher Login/EndevaourAucReportforTeach";
import { EndeavourOfferAttendance } from "./Pages/Endeavour Teacher Login/EndeavourOfferAttendance";
import { SundaySclTeachDash } from "./Pages/Sunday School Teacher Login/SundaySclTeachDash";
import { SundaySclStudents } from "./Pages/Sunday School Teacher Login/SundaySclStudents";
import { SundayEventSclTeach } from "./Pages/Sunday School Teacher Login/SundayEventSclTeach";
import { SundaySchoolAuctionTeach } from "./Pages/Sunday School Teacher Login/SundaySchoolAuctionTeach";
import { SundaySclAuctionReportforTeach } from "./Pages/Sunday School Teacher Login/SundaySclAuctionReportforTeach";
import { SundaySclTeachOfferAttendance } from "./Pages/Sunday School Teacher Login/SundaySclTeachOfferAttendance";
import { MenAuction } from "./Pages/Men Fellowship/MenAuction";
import { MenAuctionReport } from "./Pages/Men Fellowship/MenAuctionReport";
import { WomenAuction } from "./Pages/Women Fellowship/WomenAuction";
import { WomenAuctionReport } from "./Pages/Women Fellowship/WomenAuctionReport";
import { YouthAuction } from "./Pages/Youth/YouthAuction";
import { YouthAuctionReport } from "./Pages/Youth/YouthAuctionReport";
import { Minutes } from "./Pages/Church Minutes/Minutes";
import { Agenda } from "./Pages/Church Minutes/Agenda";
import { ChoirList } from "./Pages/Choir/ChoirList";
import { ChoirMaster } from "./Pages/Choir/ChoirMaster";
import { ChoirEvent } from "./Pages/Choir/ChoirEvent";
import { ChoirNotification } from "./Pages/Choir/ChoirNotification";
import { ChoirExpense } from "./Pages/Choir/ChoirExpense";
import { RegularExpense } from "./Pages/Expense/RegularExpense";
import { AddExpense } from "./Pages/Expense/AddExpense";
import { ChurchExpense } from "./Pages/Expense/ChurchExpense";
import { PaidExpense } from "./Pages/Expense/PaidExpense";
import { ApprovedExpense } from "./Pages/Expense/ApprovedExpense";
import { MrgHallDash } from "./Pages/Marriage Hall/MrgHallDash";
import { MarriageHallList } from "./Pages/Marriage Hall/MarriageHallList";
import { BookHall } from "./Pages/Marriage Hall/BookHall";
import { MrgHallAsset } from "./Pages/Marriage Hall/MrgHallAsset";
import { AddSundaySclExpense } from "./Pages/Sunday School/AddSundaySclExpense";
import { SundaySclApprovedExpense } from "./Pages/Sunday School/SundaySclApprovedExpense";
import { SundaySclPaidExpense } from "./Pages/Sunday School/SundaySclPaidExpense";
import { SundaySclExpense } from "./Pages/Sunday School/SundaySclExpense";
import { AddEndeavourExpense } from "./Pages/Endevour/AddEndeavourExpense";
import { EndeavourPaidExpense } from "./Pages/Endevour/EndeavourPaidExpense";
import { EndeavourApprovedExpense } from "./Pages/Endevour/EndeavourApprovedExpense";
import { EndeavourExpense } from "./Pages/Endevour/EndeavourExpense";
import { AddMenFellowExpense } from "./Pages/Men Fellowship/AddMenFellowExpense";
import { MenPaidExpense } from "./Pages/Men Fellowship/MenPaidExpense";
import { MenApprovedExpense } from "./Pages/Men Fellowship/MenApprovedExpense";
import { MenExpense } from "./Pages/Men Fellowship/MenExpense";
import { AddWomenFellowExpense } from "./Pages/Women Fellowship/AddWomenFellowExpense";
import { WomenPaidExpense } from "./Pages/Women Fellowship/WomenPaidExpense";
import { WomenApprovedExpense } from "./Pages/Women Fellowship/WomenApprovedExpense";
import { WomenExpense } from "./Pages/Women Fellowship/WomenExpense";
import { AddCoupleExpense } from "./Pages/Couple/AddCoupleExpense";
import { CouplePaidExpense } from "./Pages/Couple/CouplePaidExpense";
import { CoupleApprovedExpense } from "./Pages/Couple/CoupleApprovedExpense";
import { CoupleExpense } from "./Pages/Couple/CoupleExpense";
import { AddYouthExpense } from "./Pages/Youth/AddYouthExpense";
import { YouthPaidExpense } from "./Pages/Youth/YouthPaidExpense";
import { YouthApprovedExpense } from "./Pages/Youth/YouthApprovedExpense";
import { YouthExpense } from "./Pages/Youth/YouthExpense";
import { AddChoirExpense } from "./Pages/Choir/AddChoirExpense";
import { ChoirPaidExpense } from "./Pages/Choir/ChoirPaidExpense";
import { ChoirApprovedExpense } from "./Pages/Choir/ChoirApprovedExpense";
import { AddPlots } from "./Pages/Cemetery/AddPlots";
import { BookSlots } from "./Pages/Cemetery/BookSlots";
import { ReservedSlots } from "./Pages/Cemetery/ReservedSlots";
import { AddEndeavourEvent } from "./Pages/Endevour/AddEndeavourEvent";
import { EditEndeavourEvent } from "./Pages/Endevour/EditEndeavourEvent";
import { AddSundaySchoolEvent } from "./Pages/Sunday School/AddSundaySchoolEvent";
import { EditSundaySchoolEvent } from "./Pages/Sunday School/EditSundaySchoolEvent";
import { AddWomenEvent } from "./Pages/Women Fellowship/AddWomenEvent";
import { EditWomenEvent } from "./Pages/Women Fellowship/EditWomenEvent";
import { SundaySclExam } from "./Pages/Sunday School/SundaySclExam";
import { AddSundaySclExam } from "./Pages/Sunday School/AddSundaySclExam";
import { EditSundaySclExam } from "./Pages/Sunday School/EditSundaySclExam";
import { SundaySclExamTeach } from "./Pages/Sunday School Teacher Login/SundaySclExamTeach";
import { EndeavourSclExam } from "./Pages/Endevour/EndeavourSclExam";
import { AddEndeavourExam } from "./Pages/Endevour/AddEndeavourExam";
import { EditEndeavourExam } from "./Pages/Endevour/EditEndeavourExam";
import { EndeavourSclExamTeach } from "./Pages/Endeavour Teacher Login/EndeavourSclExamTeach";
import { OfferingReports } from "./Pages/All Reports/OfferingReports";
import { SubscriptionReport } from "./Pages/All Reports/SubscriptionReport";
import { AuctionReportsAll } from "./Pages/All Reports/AuctionReportsAll";
import { HarvestAuctionAllReports } from "./Pages/All Reports/HarvestAuctionAllReports";
import { SundaySchoolReports } from "./Pages/All Reports/SundaySchoolReports";
import { EndeavourReports } from "./Pages/All Reports/EndeavourReports";
import { MenReports } from "./Pages/All Reports/MenReports";
import { WomenReports } from "./Pages/All Reports/WomenReports";
import { YouthReports } from "./Pages/All Reports/YouthReports";
import { CoupleReports } from "./Pages/All Reports/CoupleReports";
import { MarriageHallReports } from "./Pages/All Reports/MarriageHallReports";
import { CemeteryReports } from "./Pages/All Reports/CemeteryReports";
import { MinistryOfferType } from "./Pages/Offerings/MinistryOfferType";
import { MinistryOfferingList } from "./Pages/Offerings/MinistryOfferingList";
import { StaffList } from "./Pages/Church Staffs/StaffList";
import { PayStaff } from "./Pages/Church Staffs/PayStaff";
import { AddHallBooking } from "./Pages/Marriage Hall/AddHallBooking";
import { EditHallBooking } from "./Pages/Marriage Hall/EditHallBooking";
import { TypesOfExpense } from "./Pages/Accounts/TypesOfExpense";
import { Expense } from "./Pages/Accounts/Expense";
import { SundayDonation } from "./Pages/Missionary Sunday/SundayDonation";
import { SundayCoverOffertory } from "./Pages/Missionary Sunday/SundayCoverOffertory";
import { BiriyaniToken } from "./Pages/Missionary Sunday/BiriyaniToken";
import { CanteenCollection } from "./Pages/Missionary Sunday/CanteenCollection";
import { AsanamCollection } from "./Pages/Asanam/AsanamCollection";
import { AsanamTiffinCarrier } from "./Pages/Asanam/AsanamTiffinCarrier";
import { AsanamUniform } from "./Pages/Asanam/AsanamUniform";
import { PoorHelptypes } from "./Pages/Poor Help/PoorHelptypes";
import { AddSubtitle } from "./Pages/Poor Help/AddSubtitle";
import { Donation } from "./Pages/Poor Help/Donation";
import { OtherIncomeTitles } from "./Pages/Other Incomes/OtherIncomeTitles";
import { OtherIncomeDonation } from "./Pages/Other Incomes/OtherIncomeDonation";
import { ShopList } from "./Pages/Shop/ShopList";
import { ShopRentalList } from "./Pages/Shop/ShopRentalList";
import { ViewRentals } from "./Pages/Shop/ViewRentals";
import { CarolList } from "./Pages/Carol/CarolList";
import { AddCarolCollection } from "./Pages/Carol/AddCarolCollection";
import { HouseVisitList } from "./Pages/House Visit and Prayer/HouseVisitList";
import { HarvestCollection } from "./Pages/Harvest Auction/HarvestCollection";
import { HarvestBiriyaniToken } from "./Pages/Harvest Auction/HarvestBiriyaniToken";
import { HarvestCanteen } from "./Pages/Harvest Auction/HarvestCanteen";
import { MarriageList } from "./Pages/Marriage/MarriageList";
import { AddMarriage } from "./Pages/Marriage/AddMarriage";
import { Matrimonial } from "./Pages/Matrimonial Fees/Matrimonial";
import { AddNewMember } from "./Pages/Member List/AddNewMember";
import { MemberList } from "./Pages/Member List/MemberList";
import { MemberEdit } from "./Pages/Member List/MemberEdit";
import { MemberView } from "./Pages/Member List/MemberView";
import { NewFamilyList } from "./Pages/Family List/NewFamilyList";
import { ReceiptsList } from "./Pages/Accounts/ReceiptsList";
import { AddReciepts } from "./Pages/Accounts/AddReciepts";
import { CreditorsList } from "./Pages/Creditors/CreditorsList";
import { NewFamilyPreview } from "./Pages/Family List/NewFamilyPreview";
import { FamilyMemberView } from "./Pages/Family List/FamilyMemberView";
import { HarvestCoverOffertory } from "./Pages/Harvest Auction/HarvestCoverOffertory";
import { MemberStatusCheck } from "./Pages/Subscription/MemberStatusCheck";
import { HoldedMembers } from "./Pages/Subscription/HoldedMembers";
import { VoterList } from "./Pages/Voters/VoterList";
import { PastorList } from "./Pages/New Pastor/PastorList";
import { AddPastor } from "./Pages/New Pastor/AddPastor";
import { ViewPastor } from "./Pages/New Pastor/ViewPastor";
import { PastorFamPreview } from "./Pages/New Pastor/PastorFamPreview";
import { EditPastor } from "./Pages/New Pastor/EditPastor";
import { EditPastorFamMem } from "./Pages/New Pastor/EditPastorFamMem";
import { ViewPastorFamMem } from "./Pages/New Pastor/ViewPastorFamMem";
import { AddPastorFamily } from "./Pages/New Pastor/AddPastorFamily";
import { AccountReports } from "./Pages/All Reports/AccountReports";
import { TallyMigrate } from "./Pages/Migrate to Tally/TallyMigrate";
import { AddHallAssets } from "./Pages/Marriage Hall/AddHallAssets";
import { ViewHallAsset } from "./Pages/Marriage Hall/ViewHallAsset";
import { EditHallAsset } from "./Pages/Marriage Hall/EditHallAsset";
import { ScraporRemoveAssets } from "./Pages/Marriage Hall/ScraporRemoveAssets";
import { IssueHallAssets } from "./Pages/Marriage Hall/IssueHallAssets";
import { MrgHallKitchenAssets } from "./Pages/Marriage Hall/MrgHallKitchenAssets";
import { ViewKitchenAssets } from "./Pages/Marriage Hall/ViewKitchenAssets";
import { CloseHallBill } from "./Pages/Marriage Hall/CloseHallBill";
import { MarriageCertList } from "./Pages/Adding Certificates/MarriageCertList";
import { AddMarriageCert } from "./Pages/Adding Certificates/AddMarriageCert";
import { ViewMrgCert } from "./Pages/Adding Certificates/ViewMrgCert";
import { BaptismCertList } from "./Pages/Adding Certificates/BaptismCertList";
import { AddBaptismCert } from "./Pages/Adding Certificates/AddBaptismCert";
import { ViewBaptismCert } from "./Pages/Adding Certificates/ViewBaptismCert";
import { DeathCertList } from "./Pages/Adding Certificates/DeathCertList";
import { AddDeathCert } from "./Pages/Adding Certificates/AddDeathCert";
import { ViewDeathCert } from "./Pages/Adding Certificates/ViewDeathCert";
import { BankList } from "./Pages/Accounts/BankList";
import { TypesofReceipts } from "./Pages/Accounts/TypesofReceipts";
import { JournalList } from "./Pages/Accounts/JournalList";
import { SystemLedger } from "./Pages/Journal/SystemLedger";
import { OpeningBalance } from "./Pages/Accounts/OpeningBalance";
import { WomenSubscribers } from "./Pages/Women Fellowship/WomenSubscribers";
import { TypesofLedgers } from "./Pages/Accounts/TypesofLedgers";
import { LedgerList } from "./Pages/Accounts/LedgerList";
import { CreditorsReport } from "./Pages/All Reports/CreditorsReport";
import { ViewReceipts } from "./Pages/Accounts/ViewReceipts";
import { MenSubscribers } from "./Pages/Men Fellowship/MenSubscribers";
import { TrialBalance } from "./Pages/All Reports/TrialBalance";
import { Depreciation } from "./Pages/All Reports/Depreciation";
import { BalanceSheet } from "./Pages/All Reports/BalanceSheet";
import { ReceiptAndPayment } from "./Pages/All Reports/ReceiptAndPayment";
import { PrintLabel } from "./Pages/Subscription/PrintLabel";
import { Deppreciation } from "./Pages/Deppreciation/Deppreciation";
import { BankReconState } from "./Pages/Accounts/BankReconState";
import { BankReconReport } from "./Pages/Accounts/BankReconReport";
import { CemBanks } from "./Pages/Cemetey Accounts/CemBanks";
import { CemLedger } from "./Pages/Cemetey Accounts/CemLedger";
import { CemLedgerTypes } from "./Pages/Cemetey Accounts/CemLedgerTypes";
import { CemReceipts } from "./Pages/Cemetey Accounts/CemReceipts";
import { CemAddReceipts } from "./Pages/Cemetey Accounts/CemAddReceipts";
import { CemReceiptsView } from "./Pages/Cemetey Accounts/CemReceiptsView";
import { CemPayments } from "./Pages/Cemetey Accounts/CemPayments";
import { CemCashAcc } from "./Pages/Cemetey Accounts/CemCashAcc";
import { CemJournal } from "./Pages/Cemetey Accounts/CemJournal";
import { SubsReport } from "./Pages/Subscription/SubsReport";
import { SubsReportView } from "./Pages/Subscription/SubsReportView";
import BibleSentence from "./Pages/Bible Sentence/BibleSentenceList"
import Voucher from "./Pages/Voucher/Voucher";
import { EditReceipts } from "./Pages/Accounts/EditReceipts";
import { AsanamReport } from "./Pages/Asanam/AsanamReport";
import { AsanamDonation } from "./Pages/Asanam/AsanamDonation";
import { AddStudents } from "./Pages/Sunday School/SundaySchoolAddStudents";
import { ViewEvent } from "./Pages/Sunday School/ViewEvent";
import { ViewSundayExam } from "./Pages/Sunday School/ViewSundayExam";
import { MarkAttendance } from "./Pages/Sunday School/MarkAttendance";
import SundayEventEdit from "./Pages/Sunday School Teacher Login/SundayEventEdit"
import SundayEventDetails from "./Pages/Sunday School Teacher Login/SundayEventDetails";
import { SundaySclExamTeachView } from "./Pages/Sunday School Teacher Login/SundaySclExamTeachView";
import { SundaySclExamAddParticipants } from "./Pages/Sunday School Teacher Login/SundaySclExamAddParticipants";
import { SundayExamAddMarks } from "./Pages/Sunday School Teacher Login/SundayExamAddMarks";
import { MemberDashOverlay } from "./Pages/Member Login/MemberDashOverlay";
import { IncomeExpenditure } from "./Pages/All Reports/IncomeExpenditure";
import { CoupleActivities } from "./Pages/Couple/CoupleActivities";
import ScrollToTop from "./ScrollToTop";
import { AddChoirEvent } from "./Pages/Choir/AddChoirEvent";
import { EditChoirEvent } from "./Pages/Choir/EditChoirEvent";
import { AddChoirParticipants } from "./Pages/Choir/AddChoirParticipants";
import { ViewChoirEvent } from "./Pages/Choir/ViewChoirEvent";
import { CoupleEvent } from "./Pages/Couple/CoupleEvent";
import { CoupleAddEvent } from "./Pages/Couple/CoupleAddEvent";
import { CoupleEdtiEvent } from "./Pages/Couple/CoupleEdtiEvent";
import { CoupleAddParticipants } from "./Pages/Couple/CoupleAddParticipants";
import { CoupleViewEvent } from "./Pages/Couple/CoupleViewEvent";
import { Notification } from "./Pages/Notification/Notification";
import SessionTimeout from "./SessionTimeout";
import SmallSizedModal from "./Components/Expense/SmallSizedModal";
import { WomenOpenBal } from "./Pages/Women Acc/WomenOpenBal";
import { WomenBank } from "./Pages/Women Acc/WomenBank";
import { WomRecList } from "./Pages/Women Acc/WomRecList";
import { AddWomRec } from "./Pages/Women Acc/AddWomRec";
import { ViewWomRec } from "./Pages/Women Acc/ViewWomRec";
import { EditWomenRec } from "./Pages/Women Acc/EditWomenRec";
import { WomPayment } from "./Pages/Women Acc/WomPayment";
import { WomJournal } from "./Pages/Women Acc/WomJournal";
import { SubsRptPerYear } from "./Pages/Subscription/SubsRptPerYear";

export const URL = import.meta.env.VITE_BACKEND_API_URL;

function App() {

  const [sessionExpired, setSessionExpired] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const handleSessionTimeout = () => {
    setSessionExpired(true);

    setTimeout(() => {
      sessionStorage.clear();
      window.location.href = "/";
    }, 3000);
  };

  useEffect(() => {
    // ❌ Disable right click
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    // ❌ Disable middle click (wheel click → new tab)
    const disableMiddleClick = (e) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ❌ Block screenshot & devtools keys
    const disableKeys = (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C", "S"].includes(e.key)) ||
        (e.ctrlKey && ["U", "P"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("auxclick", disableMiddleClick); // 🔥 THIS IS THE KEY
    document.addEventListener("keydown", disableKeys);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("auxclick", disableMiddleClick);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  // useEffect(() => {
  //   const TAB_ID_KEY = "APP_TAB_ID";
  //   const MASTER_KEY = "APP_MASTER_TAB_V2";

  //   const tabId = sessionStorage.getItem(TAB_ID_KEY) || crypto.randomUUID();
  //   sessionStorage.setItem(TAB_ID_KEY, tabId);

  //   const master = JSON.parse(localStorage.getItem(MASTER_KEY) || "null");

  //   // 🚫 If another tab exists
  //   if (master && master.tabId !== tabId) {
  //     setBlocked(true);
  //     return;
  //   }

  //   // ✅ Set this tab as master
  //   localStorage.setItem(
  //     MASTER_KEY,
  //     JSON.stringify({
  //       tabId,
  //       time: Date.now(),
  //     })
  //   );

  //   const cleanup = () => {
  //     const current = JSON.parse(localStorage.getItem(MASTER_KEY) || "null");
  //     if (current?.tabId === tabId) {
  //       localStorage.removeItem(MASTER_KEY);
  //     }
  //   };

  //   window.addEventListener("beforeunload", cleanup);

  //   return () => {
  //     cleanup();
  //     window.removeEventListener("beforeunload", cleanup);
  //   };
  // }, []);

  // if (blocked) {
  //   return (
  //     <div style={{ textAlign: "center", marginTop: "20%" }}>
  //       <h2>This application is already open in another tab.</h2>
  //       <p>Please close the other tab to continue.</p>
  //     </div>
  //   );
  // }

  return (
    <React.Fragment>
      <BrowserRouter>
        <SessionTimeout onTimeout={handleSessionTimeout} />
        <SmallSizedModal
          isOpen={sessionExpired}
          onClose={() => { }}
          title="Session Expired"
        >
          <div className="text-center py-3">
            <p className="text-gray-700 text-sm">
              Session timed out, please login again
            </p>

            <p className="text-red-500 mt-3 font-medium animate-pulse">
              Logging Out...
            </p>
          </div>
        </SmallSizedModal>
        <ScrollToTop />
        <Routes>
          {/* <Route path="*" element={<Navigate to={`/`} />} />  */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/" element={<Login />} />

          <Route path="admin" element={<ContainerMain />}>

            {/* Member routes (restricted to 'member') */}
            {/* Role based Dashes Only */}
            <Route
              path="dashmember"
              element={<PrivateRoute allowedRoles={['member']}><MemberDash /></PrivateRoute>}
            />
            <Route
              path="treasurerdash"
              element={<PrivateRoute allowedRoles={['treasurer']}><TreasurerDash /></PrivateRoute>}
            />
            <Route
              path="accountantdash"
              element={<PrivateRoute allowedRoles={['accountant']}><AccountantDash /></PrivateRoute>}
            />
            <Route
              path="secretarydash"
              element={<PrivateRoute allowedRoles={['secretary']}><SecretaryDash /></PrivateRoute>}
            />
            <Route
              path="sundaysclaccdash"
              element={<PrivateRoute allowedRoles={['sundaysclaccountant']}><SundaySclAccDash /></PrivateRoute>}
            />
            <Route
              path="churchofficeworkerdash"
              element={<PrivateRoute allowedRoles={['churchofficeworker', 'officestaff']}><ChurchOfficeWorkerDash /></PrivateRoute>}
            />



            <Route
              path="detailsofmembers"
              element={<PrivateRoute allowedRoles={['member']}><MemberDetails /></PrivateRoute>}
            />
            <Route
              path="paymentmember"
              element={<PrivateRoute allowedRoles={['member']}><MemberPayments /></PrivateRoute>}
            />
            <Route
              path="dashboard"
              element={<PrivateRoute allowedRoles={['admin', 'treasurer']}><Dashboard /></PrivateRoute>}
            />
            <Route
              path="reminders"
              element={<PrivateRoute allowedRoles={['admin']}><RemindersReports /></PrivateRoute>}
            />
            <Route
              path="dashmember/:memberId"
              element={
                <PrivateRoute allowedRoles={["member"]}>
                  <MemberDashOverlay />
                </PrivateRoute>
              }
            />



            <Route path="familylist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><NewFamilyList /></PrivateRoute>} />
            <Route path="familylist/familymemberslist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><NewFamilyPreview /></PrivateRoute>} />
            <Route path="familylist/familymemberslist/familymemberview/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><FamilyMemberView /></PrivateRoute>} />

            <Route path="memberlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><MemberList /></PrivateRoute>} />
            <Route path="memberlist/addnewmember" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><AddNewMember /></PrivateRoute>} />
            <Route path="memberlist/editmember/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><MemberEdit /></PrivateRoute>} />
            <Route path="memberlist/viewmember/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><MemberView /></PrivateRoute>} />

            {/* Accounts */}


            <Route path="pastorlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><PastorList /></PrivateRoute>} />
            <Route path="pastorlist/addpastor" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><AddPastor /></PrivateRoute>} />
            <Route path="pastorlist/viewpastor/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><ViewPastor /></PrivateRoute>} />
            <Route path="pastorlist/pastorfampreview/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><PastorFamPreview /></PrivateRoute>} />
            <Route path="pastorlist/editpastor/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><EditPastor /></PrivateRoute>} />
            <Route path="pastorlist/editpastorfammem/:pastorId/:memberId" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><EditPastorFamMem /></PrivateRoute>} />
            <Route path="pastorlist/viewpastorfammem/:pastorId/:memberId" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer', 'officestaff']}><ViewPastorFamMem /></PrivateRoute>} />
            <Route
              path="pastorlist/addpastorfamily/:id"
              element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer', 'officestaff']}><AddPastorFamily /></PrivateRoute>}
            />



            <Route
              path="pastordashboard"
              element={<PrivateRoute allowedRoles={['admin', 'pastorprimary']}><PastorDashboard /></PrivateRoute>}
            />
            <Route
              path="pastorserviceactivities"
              element={<PrivateRoute allowedRoles={['admin', 'pastorprimary']}><ServiceActivities /></PrivateRoute>}
            />

            <Route path="sundaydonation" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><SundayDonation /></PrivateRoute>} />
            <Route path="sundaycoveroffertory" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><SundayCoverOffertory /></PrivateRoute>} />
            <Route path="biriyanitoken" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><BiriyaniToken /></PrivateRoute>} />
            <Route path="canteen" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CanteenCollection /></PrivateRoute>} />

            <Route path="poorhelptypes" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><PoorHelptypes /></PrivateRoute>} />
            <Route path="addtitle" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><AddSubtitle /></PrivateRoute>} />
            <Route path="donation" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><Donation /></PrivateRoute>} />

            <Route path="otherincomes" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><OtherIncomeTitles /></PrivateRoute>} />
            <Route path="otherincomedonation" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><OtherIncomeDonation /></PrivateRoute>} />


            <Route path="asanamcollection" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AsanamCollection /></PrivateRoute>} />
            <Route path="asanamtiffincarrier" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AsanamTiffinCarrier /></PrivateRoute>} />
            <Route path="asanamuniform" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AsanamUniform /></PrivateRoute>} />
            <Route path="asanamreport" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AsanamReport /></PrivateRoute>} />
            <Route path="asanamdonation" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AsanamDonation /></PrivateRoute>} />

            <Route path="banklist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><BankList /></PrivateRoute>} />

            {/* Expense, offerings, auction */}


            <Route path="mrghalldash" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><MrgHallDash /></PrivateRoute>} />
            <Route path="mrghalllist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><MarriageHallList /></PrivateRoute>} />
            <Route path="mrghallbookings" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><BookHall /></PrivateRoute>} />
            <Route path="mrghallbookings/addhallbookings" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><AddHallBooking /></PrivateRoute>} />
            <Route path="mrghallbookings/edithallbookings/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><EditHallBooking /></PrivateRoute>} />
            <Route path="mrghallasset" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><MrgHallAsset /></PrivateRoute>} />
            <Route path="mrghallasset/addhallasset" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><AddHallAssets /></PrivateRoute>} />
            <Route path="mrghallasset/viewhallasset/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ViewHallAsset /></PrivateRoute>} />
            <Route path="mrghallasset/edithallasset/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><EditHallAsset /></PrivateRoute>} />
            <Route path="mrghallbookings/closehallbill/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><CloseHallBill /></PrivateRoute>} />
            <Route path="mrghallasset/scraporremovehallasset/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><ScraporRemoveAssets /></PrivateRoute>} />
            <Route path="mrghallkitchenassets" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><MrgHallKitchenAssets /></PrivateRoute>} />
            <Route path="mrghallkitchenassets/viewkitchenassets/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ViewKitchenAssets /></PrivateRoute>} />
            <Route path="issuedhallassets" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><IssueHallAssets /></PrivateRoute>} />





            <Route path="offerings" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', 'churchofficeworker']}><FamilyContainer /></PrivateRoute>}>
              <Route path="type" element={<OfferType />} />
              <Route path="Common/list/:category" element={<OfferingList />} />
              <Route path="list/MarriageOfferings" element={<MarriageOfferings />} />
              <Route path="bagtype" element={<BagOfferType />} />
              <Route path="BagOffer/list/:category" element={<BagOfferList />} />
              <Route path="ministryoffertype" element={<MinistryOfferType />} />
              <Route path="MinistryOffer/list/:category" element={<MinistryOfferingList />} />
              <Route path="auction" element={<Auction />} />
            </Route>

            {/* Sunday school, End school, reports */}
            <Route path="dashsundayschool" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><DashSundayschool /></PrivateRoute>} />
            <Route path="class" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><ClassSunday /></PrivateRoute>} />
            <Route path="teacher" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><Teacher /></PrivateRoute>} />
            <Route path="student" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><Student /></PrivateRoute>} />
            <Route path="student/add" element={<PrivateRoute allowedRoles={["admin", "sundaysclscretary", "accountant", "secretary", "sundaysclaccountant", 'treasurer']}   > <AddStudents />  </PrivateRoute>} />

            <Route path="event" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><Event /></PrivateRoute>} />
            <Route path="event/view/:id" element={<PrivateRoute allowedRoles={['admin', 'sundaysclscretary', 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><ViewEvent /> </PrivateRoute>} />
            <Route path="event/addsundayschoolevent" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant']}><AddSundaySchoolEvent /></PrivateRoute>} />
            <Route path="event/editevent/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'sundaysclscretary', 'endeavourclaccountant']}><EditSundaySchoolEvent /></PrivateRoute>} />
            <Route path="exam" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'treasurer']}><SundaySclExam /></PrivateRoute>} />
            <Route path="exam/view/:id" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'treasurer']}>  <ViewSundayExam /> </PrivateRoute>} />
            <Route path="exam/addsundayschoolexam" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary"]}><AddSundaySclExam /></PrivateRoute>} />
            <Route path="exam/editsundaysclexam/:id" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary"]}><EditSundaySclExam /></PrivateRoute>} />
            <Route path="studentauction" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant']}><Studentauction /></PrivateRoute>} />
            <Route path="studentauctionreport" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant']}><StudentAucReport /></PrivateRoute>} />
            <Route path="sunday-attendance" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'treasurer']}><SundaySclOfferings /></PrivateRoute>} />
            <Route path="sunday-attendance/mark/:classId/:date" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant']} ><MarkAttendance /></PrivateRoute>} />
            <Route path="sundayscladdexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclaccountant']}><AddSundaySclExpense /></PrivateRoute>} />
            <Route path="sundaysclpaidexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclaccountant']}><SundaySclPaidExpense /></PrivateRoute>} />
            <Route path="sundaysclapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary"]}><SundaySclApprovedExpense /></PrivateRoute>} />
            <Route path="sundaysclexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclscretary']}><SundaySclExpense /></PrivateRoute>} />

            {/* Sunday School Teacher Login  */}
            <Route path="sundayschoolteacherdashboard" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclTeachDash /></PrivateRoute>} />
            <Route path="sundayschoolstudents" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclStudents /></PrivateRoute>} />
            <Route path="sundayschoolevent" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundayEventSclTeach /></PrivateRoute>} />
            <Route path="sundayschoolexam" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclExamTeach /></PrivateRoute>} />
            <Route path="sundayschoolauction" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySchoolAuctionTeach /></PrivateRoute>} />
            <Route path="sundayschoolreportforauction" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclAuctionReportforTeach /></PrivateRoute>} />
            <Route path="sundayschoolofferingsandattendance" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclTeachOfferAttendance /></PrivateRoute>} />
            <Route path="sundayschoolevent/edit/:id" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundayEventEdit /></PrivateRoute>} />
            <Route path="sundayschoolevent/view/:id" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundayEventDetails /></PrivateRoute>} />
            <Route path="sundayschoolexam/:examId" element={<PrivateRoute allowedRoles={['sundaysclteacher']}> <SundaySclExamTeachView />  </PrivateRoute>} />
            <Route path="sundayschoolexam/:examId/participants" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclExamAddParticipants /></PrivateRoute>} />
            <Route path="sundayschoolexam/:examId/marks" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundayExamAddMarks /></PrivateRoute>} />

            {/* End school */}
            <Route path="dashendschool" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Dashendschool /></PrivateRoute>} />
            <Route path="classend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Classend /></PrivateRoute>} />
            <Route path="teacherend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Teacherend /></PrivateRoute>} />
            <Route path="studentend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Studentend /></PrivateRoute>} />
            <Route path="eventend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Eventend /></PrivateRoute>} />
            <Route path="eventend/addendeavourevent" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><AddEndeavourEvent /></PrivateRoute>} />
            <Route path="eventend/edit/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><EditEndeavourEvent /></PrivateRoute>} />
            <Route path="endeavourexam" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><EndeavourSclExam /></PrivateRoute>} />
            <Route path="endeavourexam/addendeavourexam" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><AddEndeavourExam /></PrivateRoute>} />
            <Route path="endeavourexam/editendeavourexam/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><EditEndeavourExam /></PrivateRoute>} />
            <Route path="studentauctionend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><Studentauctionend /></PrivateRoute>} />
            <Route path="endeavouraucreport" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><EndeavourAucReport /></PrivateRoute>} />
            <Route path="endofferings" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant']}><EndSclOfferings /></PrivateRoute>} />
            <Route path="endeavouraddexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavourclaccountant']}><AddEndeavourExpense /></PrivateRoute>} />
            <Route path="endeavourpaidexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavourclaccountant']}><EndeavourPaidExpense /></PrivateRoute>} />
            <Route path="endeavourapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "endeavoursclscretary"]}><EndeavourApprovedExpense /></PrivateRoute>} />
            <Route path="endeavourexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavoursclscretary']}><EndeavourExpense /></PrivateRoute>} />

            <Route path="biblesentence" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}> <BibleSentence /></PrivateRoute>} />


            {/* Endeavour Teacher */}
            <Route path="endeavourteacherdashboard" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourTeachDash /></PrivateRoute>} />
            <Route path="endeavourstudents" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourStudents /></PrivateRoute>} />
            <Route path="endeavourevent" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourEvent /></PrivateRoute>} />
            <Route path="endeavourteacherexam" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourSclExamTeach /></PrivateRoute>} />
            <Route path="endeavourauction" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourAuction /></PrivateRoute>} />
            <Route path="auctionreportendeavour" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndevaourAucReportforTeach /></PrivateRoute>} />
            <Route path="endeavourofferingsandattendance" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourOfferAttendance /></PrivateRoute>} />



            {/* Reports */}
            <Route path="Reports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><ReportsPage /></PrivateRoute>} />
            <Route path="birthday" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><BirthdayReports /></PrivateRoute>} />
            <Route path="marriage" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><MarriageReports /></PrivateRoute>} />
            <Route path="baptism" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><BaptismReports /></PrivateRoute>} />
            <Route path="communion" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><CommunionReports /></PrivateRoute>} />
            <Route path="inactive" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><InActiveReports /></PrivateRoute>} />
            <Route path="rejoining" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><RejoiningReports /></PrivateRoute>} />
            <Route path="auctionreport" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><AuctionReport /></PrivateRoute>} />

            {/*All Reports */}
            <Route path="OfferingReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><OfferingReports /></PrivateRoute>} />
            <Route path="SubscriptionReport" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><SubscriptionReport /></PrivateRoute>} />
            <Route path="AuctionReportsAll" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><AuctionReportsAll /></PrivateRoute>} />
            <Route path="HarvestAuctionReportsAll" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><HarvestAuctionAllReports /></PrivateRoute>} />
            <Route path="SundaySchoolReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><SundaySchoolReports /></PrivateRoute>} />
            <Route path="EndeavourReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><EndeavourReports /></PrivateRoute>} />
            <Route path="MenReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><MenReports /></PrivateRoute>} />
            <Route path="WomenReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><WomenReports /></PrivateRoute>} />
            <Route path="YouthReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><YouthReports /></PrivateRoute>} />
            <Route path="CoupleReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><CoupleReports /></PrivateRoute>} />
            <Route path="MarriageHallReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><MarriageHallReports /></PrivateRoute>} />
            <Route path="CemeteryReports" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', "churchofficeworker"]}><CemeteryReports /></PrivateRoute>} />
            <Route path="AccountsReports" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "treasurer"]}><AccountReports /></PrivateRoute>} />
            <Route path="CreditorReports" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "treasurer"]}><CreditorsReport /></PrivateRoute>} />
            <Route path="TrialBalance" element={<PrivateRoute allowedRoles={["admin", "treasurer", "accountant", "secretary", "churchofficeworker"]}><TrialBalance /></PrivateRoute>} />
            <Route path="Depreciation" element={<PrivateRoute allowedRoles={["admin", "treasurer", "accountant", "secretary", "churchofficeworker"]}><Depreciation /></PrivateRoute>} />
            <Route path="BalanceSheet" element={<PrivateRoute allowedRoles={["admin", "treasurer", "accountant", "secretary", "churchofficeworker"]}><BalanceSheet /></PrivateRoute>} />
            <Route path="ReceiptAndPayment" element={<PrivateRoute allowedRoles={["admin", "treasurer", "accountant", "secretary", "churchofficeworker"]}><ReceiptAndPayment /></PrivateRoute>} />
            <Route path="incomeexpenditure" element={<PrivateRoute allowedRoles={["admin", "treasurer", "accountant", "secretary", "churchofficeworker"]}><IncomeExpenditure /></PrivateRoute>} />



            <Route path="youthlist" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'youthsecretary', 'youthaccountant', 'treasurer']}><YouthList /></PrivateRoute>} />
            <Route path="youthauction" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'youthsecretary', 'youthaccountant']}><YouthAuction /></PrivateRoute>} />
            <Route path="youthauctionreport" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'youthsecretary', 'youthaccountant']}><YouthAuctionReport /></PrivateRoute>} />

            <Route path="youthaddexpense" element={<PrivateRoute allowedRoles={['admin', "youthaccountant"]}><AddYouthExpense /></PrivateRoute>} />
            <Route path="youthpaidexpense" element={<PrivateRoute allowedRoles={['admin', "youthaccountant"]}><YouthPaidExpense /></PrivateRoute>} />
            <Route path="youthapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "youthsecretary"]}><YouthApprovedExpense /></PrivateRoute>} />
            <Route path="youthexpense" element={<PrivateRoute allowedRoles={['admin', "youthsecretary"]}><YouthExpense /></PrivateRoute>} />

            {/* Fellowship, Harvest, Subscribers, Bills */}
            <Route path="menfellowmembers" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", 'treasurer']}><MenMembers /></PrivateRoute>} />
            <Route path="menfellowevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", 'treasurer']}><MenFellowEvent /></PrivateRoute>} />
            <Route path="menactivites" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'secretary', "mensecretary", "menaccountant", 'treasurer']}><MenActivities /></PrivateRoute>} />
            <Route path="menauction" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant"]}><MenAuction /></PrivateRoute>} />
            <Route path="menauctionreport" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant"]}><MenAuctionReport /></PrivateRoute>} />

            <Route path="menaddexpense" element={<PrivateRoute allowedRoles={['admin', "menaccountant"]}><AddMenFellowExpense /></PrivateRoute>} />
            <Route path="menpaidexpense" element={<PrivateRoute allowedRoles={['admin', "menaccountant"]}><MenPaidExpense /></PrivateRoute>} />
            <Route path="menapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "mensecretary"]}><MenApprovedExpense /></PrivateRoute>} />
            <Route path="menexpense" element={<PrivateRoute allowedRoles={['admin', "mensecretary"]}><MenExpense /></PrivateRoute>} />
            <Route path="mensubscribers" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'mensecretary', 'menaccountant', 'treasurer']}><MenSubscribers /></PrivateRoute>} />



            <Route path="womenfellowmembers" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", 'treasurer']}><WomenMember /></PrivateRoute>} />
            <Route path="womenfellowevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", 'treasurer']}><WomenFellowEvent /></PrivateRoute>} />
            <Route path="womenfellowevent/addwomenevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant"]}><AddWomenEvent /></PrivateRoute>} />
            <Route path="womenfellowevent/editwomenevent/:id" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant"]}><EditWomenEvent /></PrivateRoute>} />
            <Route path="womensubscribers" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", 'treasurer']}><WomenSubscribers /></PrivateRoute>} />
            <Route path="womenactivities" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", 'treasurer']}><WomenActivities /></PrivateRoute>} />
            <Route path="womenauction" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant"]}><WomenAuction /></PrivateRoute>} />
            <Route path="womenactionreport" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant"]}><WomenAuctionReport /></PrivateRoute>} />

            <Route path="womenaddexpense" element={<PrivateRoute allowedRoles={['admin', "womenaccountant"]}><AddWomenFellowExpense /></PrivateRoute>} />
            <Route path="womenpaidexpense" element={<PrivateRoute allowedRoles={['admin', "womenaccountant"]}><WomenPaidExpense /></PrivateRoute>} />
            <Route path="womenapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "womensecretary"]}><WomenApprovedExpense /></PrivateRoute>} />
            <Route path="womenexpense" element={<PrivateRoute allowedRoles={['admin', "womensecretary"]}><WomenExpense /></PrivateRoute>} />
            <Route path="notifications" element={<PrivateRoute allowedRoles={["admin", "secretary", "accountant", "treasurer", "churchofficeworker"]}><Notification /></PrivateRoute>} />
            <Route path="couplelist" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleList /></PrivateRoute>} />
            <Route path="couple/event" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleEvent /></PrivateRoute>} />
            <Route path="couple/event/add" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleAddEvent /></PrivateRoute>} />
            <Route path="couple/event/edit/:eventId" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleEdtiEvent /></PrivateRoute>} />
            <Route path="couple/event/view/:eventId" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleViewEvent /></PrivateRoute>} />
            <Route path="couple/event/addparticipants" element={<PrivateRoute allowedRoles={['admin', 'couplesecretary', 'secretary', 'coupleaccountant', 'treasurer']}><CoupleAddParticipants /></PrivateRoute>} />
            <Route path="coupleaddexpense" element={<PrivateRoute allowedRoles={['admin', "coupleaccountant"]}><AddCoupleExpense /></PrivateRoute>} />
            <Route path="couplepaidexpense" element={<PrivateRoute allowedRoles={['admin', "coupleaccountant"]}><CouplePaidExpense /></PrivateRoute>} />
            <Route path="coupleapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "couplesecretary"]}><CoupleApprovedExpense /></PrivateRoute>} />
            <Route path="coupleexpense" element={<PrivateRoute allowedRoles={['admin', "couplesecretary"]}><CoupleExpense /></PrivateRoute>} />
            <Route path="coupleactivities" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'couplesecretary', 'treasurer']}> <CoupleActivities /> </PrivateRoute>} />
            <Route path="addharvestauction/addharvestitem" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', "churchofficeworker"]}><AddHarvestItem /></PrivateRoute>} />
            <Route path="addharvestauction" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', "churchofficeworker", 'treasurer']}><HarvestAuction /></PrivateRoute>} />
            <Route path="addharvestauction/harvestaucreport" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', "churchofficeworker", 'treasurer']}><HarvestAucReport /></PrivateRoute>} />
            <Route path="harvestcollection" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><HarvestCollection /></PrivateRoute>} />
            <Route path="harvestbiriyanitoken" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><HarvestBiriyaniToken /></PrivateRoute>} />
            <Route path="harvestcanteen" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><HarvestCanteen /></PrivateRoute>} />
            <Route path="harvestcoveroffer" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><HarvestCoverOffertory /></PrivateRoute>} />



            <Route path="subscribers" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'treasurer', 'officestaff']}><Subscribers /></PrivateRoute>} />
            <Route path="subscribers/addsubscription" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'officestaff']}><AddSubscription /></PrivateRoute>} />
            <Route path="subscribers/subscribersdetails" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'officestaff']}><SubscriberDetails /></PrivateRoute>} />
            <Route path="memberstatus" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer', 'officestaff']}><MemberStatusCheck /></PrivateRoute>} />
            <Route path="memberstatus/holdedmembers" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer', 'officestaff']}><HoldedMembers /></PrivateRoute>} />
            <Route path="printLabel" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'officestaff']}><PrintLabel /></PrivateRoute>} />
            <Route path="subsreport" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'treasurer', 'officestaff']}><SubsReport /></PrivateRoute>} />
            <Route path="SubsRptPerYear" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'treasurer']}><SubsRptPerYear/></PrivateRoute>} />
            <Route path="subsreport/viewsubreport/:member_id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'churchofficeworker', 'treasurer', 'officestaff']}><SubsReportView /></PrivateRoute>} />

            <Route path="bills" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><BillsPages /></PrivateRoute>} />
            <Route path="bills/preview/:familyId" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><BillPreview /></PrivateRoute>} />
            <Route path="usercontrol" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'treasurer']}><Usercontrol /></PrivateRoute>} />

            <Route path="minutes" element={<PrivateRoute allowedRoles={['accountant', 'secretary', 'pastorprimary', 'treasurer', 'dcmember']}><Minutes /></PrivateRoute>} />
            <Route path="agenda" element={<PrivateRoute allowedRoles={['accountant', 'secretary', 'pastorprimary', 'treasurer', 'dcmember']}><Agenda /></PrivateRoute>} />

            <Route path="choirlist" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'treasurer']}><ChoirList /></PrivateRoute>} />
            <Route path="choirmaster" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'treasurer']}><ChoirMaster /></PrivateRoute>} />
            <Route path="choirevent" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><ChoirEvent /></PrivateRoute>} />
            <Route path="choirnotification" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><ChoirNotification /></PrivateRoute>} />
            <Route path="choirevent" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><ChoirEvent /></PrivateRoute>} />
            <Route path="choir-addevent" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><AddChoirEvent /></PrivateRoute>} />
            <Route path="choir/event/edit/:eventId" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><EditChoirEvent /></PrivateRoute>} />
            <Route path="choir-addparticipants" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><AddChoirParticipants /></PrivateRoute>} />
            <Route path="choir/event/view/:eventId" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin']}><ViewChoirEvent /></PrivateRoute>} />
            <Route path="choiraddexpense" element={<PrivateRoute allowedRoles={['admin', "choiraccountant"]}><AddChoirExpense /></PrivateRoute>} />
            <Route path="choirpaidexpense" element={<PrivateRoute allowedRoles={['admin', "choiraccountant"]}><ChoirPaidExpense /></PrivateRoute>} />
            <Route path="choirapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "choirsecretary"]}><ChoirApprovedExpense /></PrivateRoute>} />
            <Route path="choirexpense" element={<PrivateRoute allowedRoles={['admin', "choirsecretary"]}><ChoirExpense /></PrivateRoute>} />

            <Route path="addcemeteryplots" element={<PrivateRoute allowedRoles={['admin', "cemeterymanager", "churchofficeworker", 'treasurer']}><AddPlots /></PrivateRoute>} />
            <Route path="bookcemeteryslot" element={<PrivateRoute allowedRoles={['admin', "cemeterymanager", "churchofficeworker", 'treasurer']}><BookSlots /></PrivateRoute>} />
            <Route path="reservedcemeteryslot" element={<PrivateRoute allowedRoles={['admin', "cemeterymanager", "churchofficeworker", 'treasurer']}><ReservedSlots /></PrivateRoute>} />

            <Route path="stafflist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><StaffList /></PrivateRoute>} />
            <Route path="paystaff" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><PayStaff /></PrivateRoute>} />

            <Route path="shoplist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ShopList /></PrivateRoute>} />
            <Route path="shoprentallist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><ShopRentalList /></PrivateRoute>} />
            <Route path="shoprentallist/view/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><ViewRentals /></PrivateRoute>} />

            <Route path="carollist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CarolList /></PrivateRoute>} />
            <Route path="addcarolcollection" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><AddCarolCollection /></PrivateRoute>} />

            <Route path="housevisitlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><HouseVisitList /></PrivateRoute>} />

            <Route path="marriagelist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><MarriageList /></PrivateRoute>} />
            <Route path="marriagelist/addmarriage" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><AddMarriage /></PrivateRoute>} />

            <Route path="matrimonialfees" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><Matrimonial /></PrivateRoute>} />


            {/* Accounts  */}
            <Route path="typeofreceipt" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker"]}><TypesofReceipts /></PrivateRoute>} />
            <Route path="typesofexpense" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', "churchofficeworker"]}><TypesOfExpense /></PrivateRoute>} />
            <Route path="addchurchexpense" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', "churchofficeworker", 'treasurer']}><Expense /></PrivateRoute>} />
            <Route path="receiptslist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ReceiptsList /></PrivateRoute>} />
            <Route path="openingbalance" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><OpeningBalance /></PrivateRoute>} />
            <Route path="receiptslist/Addreceipts" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AddReciepts /></PrivateRoute>} />
            <Route path="receiptslist/ViewReceipts/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ViewReceipts /></PrivateRoute>} />
            <Route path="receiptslist/EditReceipts/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><EditReceipts /></PrivateRoute>} />
            <Route path="TypesofLedgerList" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><LedgerList /></PrivateRoute>} />
            <Route path="TypesofLedgerList/AddTypesofLedger" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><TypesofLedgers /></PrivateRoute>} />
            <Route path="journallist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><JournalList /></PrivateRoute>} />
            <Route path="bankreconstatement" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><BankReconState /></PrivateRoute>} />
            <Route path="bankreconreport" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><BankReconReport /></PrivateRoute>} />
            <Route path="Voucher" element={<PrivateRoute allowedRoles={["admin", "secretary", 'treasurer']}><Voucher /></PrivateRoute>} />

            {/* Women Accounts  */}
            <Route path="womenopenbal" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><WomenOpenBal /></PrivateRoute>} />
            <Route path="womenbank" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><WomenBank /></PrivateRoute>} />
            <Route path="womenReceipt" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><WomRecList /></PrivateRoute>} />
            <Route path="womenReceipt/womenAddRec" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><AddWomRec /></PrivateRoute>} />
            <Route path="womenReceipt/womenViewRec/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><ViewWomRec /></PrivateRoute>} />
            <Route path="womenReceipt/womenEditRec/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><EditWomenRec /></PrivateRoute>} />
            <Route path="womenPayment" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><WomPayment /></PrivateRoute>} />
            <Route path="womenJournal" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><WomJournal /></PrivateRoute>} />


            {/* Cemetery Accounts  */}

            <Route path="cemcashbalance" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemCashAcc /></PrivateRoute>} />
            <Route path="cembanks" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemBanks /></PrivateRoute>} />
            <Route path="cemledger" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemLedger /></PrivateRoute>} />
            <Route path="cemledger/addcemledgertypes" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemLedgerTypes /></PrivateRoute>} />
            <Route path="cemreceipts" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemReceipts /></PrivateRoute>} />
            <Route path="cemreceipts/addcemreceipts" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemAddReceipts /></PrivateRoute>} />
            <Route path="cemreceipts/editcemreceipts/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemAddReceipts /></PrivateRoute>} />
            <Route path="cemreceipts/viewcemreceipts/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemReceiptsView /></PrivateRoute>} />
            <Route path="cempayments" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemPayments /></PrivateRoute>} />
            <Route path="cemjournal" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CemJournal /></PrivateRoute>} />


            <Route path="depriciation" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><Deppreciation /></PrivateRoute>} />

            <Route path="creditorslist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><CreditorsList /></PrivateRoute>} />

            <Route path="voterlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", 'treasurer']}><VoterList /></PrivateRoute>} />

            <Route path="TallyMigrate" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><TallyMigrate /></PrivateRoute>} />


            {/* Marriage Certifcate */}
            <Route path="mrgcertlist" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><MarriageCertList /></PrivateRoute>} />
            <Route path="mrgcertlist/addmrgcertificate" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><AddMarriageCert /></PrivateRoute>} />
            <Route path="mrgcertlist/viewmrgcertificate/:id" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><ViewMrgCert /></PrivateRoute>} />

            {/* Baptism Certifcate */}
            <Route path="baptismcertlist" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><BaptismCertList /></PrivateRoute>} />
            <Route path="baptismcertlist/addbaptismcertificate" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><AddBaptismCert /></PrivateRoute>} />
            <Route path="baptismcertlist/viewbaptismcertificate/:id" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><ViewBaptismCert /></PrivateRoute>} />

            {/* Death Certifcate */}
            <Route path="deathcertlist" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><DeathCertList /></PrivateRoute>} />
            <Route path="deathcertlist/adddeathcertificate" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker']}><AddDeathCert /></PrivateRoute>} />
            <Route path="deathcertlist/viewdeathcertificate/:id" element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', 'treasurer']}><ViewDeathCert /></PrivateRoute>} />


          </Route>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;



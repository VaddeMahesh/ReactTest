
import React, { useCallback, useState, useEffect, useRef, useContext } from "react";
    import withNLS from "@shared/HOC/withNLS";
    import nls from "./nls/strings_nls";
    import {
        Button,
        Text,
        Cell,
        Row,
        Field,
        ModalDialog,
        Checkbox,
        IconStatusInformationOnLight,
    } from 'mws-common-ui';
    import styles from "./styles.pcss";
    import { CommonFields } from '@coll-core-common/components';
    import useForm from '@shared/hooks/useForm';
    import Form from '@shared/components/Form';
    import moment from 'moment';
    import fetchAccountDetail from "@coll-core/stub/accountSearch.json";  
    // import getAOrgs from "@coll-core/stub/getARorgs.json";
    import getAuthorizedProductFunctions from "@coll-core/stub/authrizationFunc.json";
    import getAuthorizedEntityFunctions from "@coll-core/stub/configuration/entitlement.json";
    import getaccountSelected from "@coll-core/stub/selectedAccount.json";
    import cutomerResponseData from "@coll-core/stub/cutomerResponseData.json";

    import { fetchFields, translate, getNextWorkDate, ngbDateFromMoment, ngbDateFromObject, NumberFormat, getUserDetails } from "@coll-core-common/components/Utils";
    import {updateInteractionResults, getDispositionCodes,getaccountDetailsData, retrieveDelinquentDemographics} from "./hooks";
    import InformationModalPopup from "./InformationModal";
    import ReviewDatePopup from "./ReviewDateModal";
    import { SharedContext } from '@coll-core/views/page/components/Service/context';
    import { useSelector, useDispatch } from 'react-redux';
    import { getDelinquentDemographics } from "../../../../lib/api";

const InteractionResult = ({ NLS, navigate, ...props }) => {

    const [interactionFields,setInteractionFields] = useState([]);
    const [mostCommonOutcomeFields,setMostCommonOutcomeFields] = useState([]);
    const [paymentAmmountsFields, setPaymentAmmountsFields] = useState([]);
    const [otherOutcomeSection] = useState([]);
    const [callBackForm, setCallBckForm] = useState([]);
    const [isCallBack, setisCallBack] = useState(false);
    const [show, setShow] = useState(false);


    const [actionCode, setActionCode] = useState('');
    const [diallerDisposition, setDiallerDisposition] = useState('');
    const [contactType, setContactType] = useState('');
    const [gceExclude, setGceExclude] = useState('');
    const [expiration, setExpiration] = useState('');
    const [terminationCode, setTerminationCode] = useState('');
    const [gceReason, setGceReason] = useState('');
    const [contactSummGrp, setContactSummGrp] = useState('');
    const [spokenTo, setSpokenTo] = useState('');
    const [nextWorkDate, setNextWorkDate] = useState('');

    const [callbackCode, setCallbackCode] = useState('');
    const [outcomeForm, setoutcomeForm] = useState('');
    const [callbackForm, setcallbackForm] = useState('');
    const [alvariaEnabled, setalvariaEnabled] = useState('');
    const [outcomeFormData, setoutcomeFormData] = useState('');

    const [accountsWithUpdates, setAccountsWithUpdates] = useState([]);
    const [channel, setChannel] = useState('');

    const [informationModalShow, setInformationModalShow] = useState(true);
    const [reviewDateModalShow, setReviewDateModalShow] = useState(false);
    const [delinquentDemographics,setDelinquentDemographics] = useState([]);
    // const [cardflag, setCardFlag] = useState('');

    const [status, setStatus] = useState('');
    const [outcome, setOutCome] = useState('');


    const {handleNotification}=props;
    const [accountListAcc] = useState(useSelector((state) => state?.custAccountSearch?.custAccountSearchData?.custAccountSearchData));
    // const [selectedAccounta] = useState(useSelector((state) => state?.selectedAccount?.selectedAccountData));
    const [selectedgetAOrgs] = useState(useSelector((state) => state?.orgsData?.getAOrgs?.orgsData));

    const cardPhoneCodes = [
      { key: 'P', label: 'Home', var: 'homePhone1' },
      { key: 'M', label: 'Mobile', var: 'mobilePhone1' },
      { key: 'B', label: 'Work', var: 'workPhone1' },
      // { key: 'A', label: 'Other', var: 'homePhone2' },
    ];
  
    
    //<START> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
    const bizPhoneCodes = [
      { key: 'D', label: 'Business Primary-Home', var: 'business1' },
      { key: 'C', label: 'Business Primary-Mobile', var: 'business2' },
  
    ];
    //<END> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
    const retailPhoneCodes = [
      { key: 'P', label: 'Customer 1-Home', var: 'homePhone1' },
      { key: 'M', label: 'Customer 1-Mobile', var: 'mobilePhone1' },
      { key: 'B', label: 'Customer 1-Work', var: 'workPhone1' },
      { key: 'A', label: 'Customer 2-Home', var: 'homePhone2' },
      { key: 'X', label: 'Customer 2-Mobile', var: 'mobilePhone2' },
      { key: 'W', label: 'Customer 2-Work', var: 'workPhone2' },
    ];
  
    let homePhone2;
    let workPhone2;
    let mobilePhone2
    let homePhone1;
    let workPhone1
    let mobilePhone1
    let business1;
    let business2;
    let cardFlag;
    let groupid;
    let otherOutcomesControlFields;
    let minHours;
    let maxHours;
    let found;
    let selIntRes;

    const [fields, setFields] = useState([]);
    const [custResponseData1, setCustResponseData] = useState(null);
    const [customerAccounts, setCustomerAccounts] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState([]);
    const [accountDetail, setAccountDetail] = useState([]);
  
    const [reviewDateAccount, setReviewDateAccount] = useState([]);
    const [excludeAccounts, setExcludeAccounts] = useState([]);
    const [checklist, setchecklist] = useState([]);
  
    const userDetailsService = useContext('');
    const [isPtpSelected, setIsPtpSelected] = useState(false);
    const [triggerCallDispose, setTriggerCallDispose] = useState(false);
    const customerAccount = { accountNumber: "1234567890" };

    const radioOptions = [
      { value: "reviewData", label: "25 Feb 2025 - Review Data" },
      { value: "nextData", label: "17 Feb 2025 - Next Data" },
     
    ];
    let removed = [];
    const accountListApiResponse = {
      "message": "Data retrieved successfully",
      "success": true,
      "meta": {
          "errors": [],
          "pageInfo": {}
      },
      "data": {
          "customerAccount": [
              {
                  "accountNumber": "0005434606093319936",
                  "accountEntityCode": "HRFB"
              }
          ]
      }
  };
    useEffect(() => {
    if (props?.status) {
      formModel.setValues({'InteractionResult':'CLBK'});
      setStatus(props?.status);
      setisCallBack(true);
      ngOnInit();
    }
    }, [props?.trigger]);
    useEffect(() => {
      // Fetch delinquent demographics
        const fetchDelinquentDemographics = async () => {
          try {
            const res = await retrieveDelinquentDemographics({});
            console.log("Response from retrieveDelinquentDemographics:", res);
            setDelinquentDemographics(res || []); // Ensure state is updated with valid data
          } catch (error) {
            console.error("Error fetching delinquent demographics:", error);
          }
        };
    
        fetchDelinquentDemographics();
  }, []);

// Trigger getInteractionResultValues when delinquentDemographics is updated
useEffect(() => {
    // Fetch fields and process interaction result values
 const fetchData = async () => {
      try {
        const responseMSG = await fetchFields("CUSTOMER_OVERVIEW_OUTCOME", "otherOutcomeSection");
        console.log("Fields fetched:", responseMSG);
        getInteractionResultValues(responseMSG[0], false);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };

    fetchData();
}, [delinquentDemographics]);
useEffect(() => {
  if (formModel.values.InteractionResult=="CLBK") {
    setisCallBack(true);
  }
  else if (formModel.values.InteractionResult!=='') {
    setisCallBack(false);
  }

}, [formModel]);

useEffect(() => {
  if (selectedAccounts.length === customerAccounts.length) {
    setIsSelectAllChecked(true);
  } else {
    setIsSelectAllChecked(false);
  }
}, [selectedAccounts, customerAccounts]);
  const formModel = useForm({
    values: {
      LocationCalled: '',
      SpokenTo: '',
      InteractionResult: '',
      NextWorkDate:'',
      outcome:'',
    },
    rules: {
      LocationCalled: [val => !!val || 'Channel is required'],
      SpokenTo:[val => !!val || 'SpokenTo is required'],
      InteractionResult:[val => !!val || 'Interaction Result is required'],
      NextWorkDate:[val => val >= moment().format('DD/MM/yyyy') || 'NextWorkDate is should be greater than current Date'],


    }
  });
  const fetchAllFields = async () => {
    try {
      const [mostCommonOutcomeFields, paymentAmountsFields] = await Promise.all([
        fetchFields("CUSTOMER_OVERVIEW_OUTCOME", "mostCommonOutcomeSection"),
        fetchFields("CUSTOMER_OVERVIEW_OUTCOME", "controlSection"),
      ]);

      setMostCommonOutcomeFields(mostCommonOutcomeFields[0]);
      setPaymentAmmountsFields(paymentAmountsFields[0]);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };
  const buildPtpButtonGroup = () => {
    buildForm1();
    buildForm2();
    fetchAllFields();
    ngOnInit();
  }
   // START - CCSN-7315 Callback Alvaria API integration changes
const productTypeList = [
  { label: 'WPB Unsecured Retail', value:'WUR', pvc: 'N', product: 'Unsecured', cli: '3456006423', meta: { 410: [], 411: [], 414: [], 421: [], 423: [] } },
  { label: 'WPB Unsecured Card', value: 'WUC', pvc: 'N', product: 'Unsecured', cli: '3456077088', meta: { '100': [], '051': [], '052': [], '053': [], '054': [], '055': [], '056': [], '057': [], '330': [], '200': [], '421': [], '423': [] } },
  { label: 'WPB Unsecured Retail Vulnerable Customer', value: 'WURV', pvc: 'Y', product: 'Unsecured', cli: '3452660288', meta: { 410: [], 411: [], 414: [], 421: [], 423: [] } },
  { label: 'WPB Unsecured Card Vulnerable Customer', value: 'WUCV', pvc: 'Y', product: 'Unsecured', cli: '3452660288', meta: { '100': [], '051': [], '052': [], '053': [], '054': [], '055': [], '056': [], '057': [], '330': [], '200': [], '421': [], '423': [] } },
  { label: 'WPB Secured Mortgages', value: 'WSMO', pvc: '', product: 'Secured', cli: '3458500633', meta: { 412: [], 413: [], 420: [], 421: [], 422: [] } },
  { label: 'WPB Secured Mart', value: 'WSMA', pvc: '', product: 'Secured', cli: '3456047786', meta: { 412: [], 413: [], 420: [], 421: [], 422: [] } },
  { label: 'WPB Secured Litigations', value: 'WSL', pvc: '', product: 'Secured', cli: '3455873667', meta: { 412: [], 413: [], 420: [], 421: [], 422: [] } },
  { label: 'WPB Secured Expired', value: 'WSE', pvc: '', product: 'Secured', cli: '3456005849', meta: { 412: [], 413: [], 420: [], 421: [], 422: [] } },
  { label: 'CMB CARD', value: 'CMBC', pvc: '', product: 'Commercial', cli: '3456031289', meta: { 300: [], 430: [], 431: [], 432: [] } },
  { label: 'CMB RETAIL', value: 'CMBR', pvc: '', product: 'Commercial', cli: '3456031289', meta: { 300: [], 430: [], 431: [], 432: [] } },
  { label: 'CMB BBL', value: 'CMBB', pvc: '', product: 'Commercial', cli: '3455873660', meta: { 430: [302, 305, 311, 312, 313, 316, 319, 320, 403, 870, 872, 886, 887, 888, 889, 948, 949] } },
  { label: 'CMB Vulnerable Customers', value: 'CMBV', pvc: '', product: 'Commercial', cli: '3458500622', meta: { 300: [], 430: [], 431: [], 432: [] } },
  { label: 'CMB Portfolio', value: 'CMBP', pvc: '', product: 'Commercial', cli: '3456024006', meta: { 300: [], 430: [], 431: [], 432: [] } }
];
  const prepareProductTypeList= (org, flag, classNumber)=>{
    let options = [];
    let pvcFlag = flag ? 'Y' : 'N';

    for (let i = 0; i < productTypeList.length; i++) {
      if (productTypeList[i].meta.hasOwnProperty(org) && (productTypeList[i].pvc == '' || pvcFlag == productTypeList[i].pvc) && (productTypeList[i].meta[org].length == 0 || -1 !== productTypeList[i].meta[org].indexOf(Number(classNumber)))) {
        options.push({ key: productTypeList[i].value, value: productTypeList[i].value, label: productTypeList[i].label });
      }
    }
    
    return options;
  }
  const custResponseData=cutomerResponseData;
  // setCardFlag(cutomerResponseData[''])
  const getLeastReviewDate = () => {
    // Implement the logic for getting the least review date
    let leastReviewDate; 
    Array.isArray(accountsWithUpdates) && accountsWithUpdates.forEach(account => {
      let reviewDate;
      if (account.nextWorkDate) {
        reviewDate = moment(account.nextWorkDate, 'MMDDYYYY');
      }
      // CCSN-311 In case of callback submitted/ptp taken before on account with no ptp amount
      if (reviewDate && account.ptpTaken) {
        if (!leastReviewDate) {
          leastReviewDate = reviewDate;
        }

        if (reviewDate.isBefore(leastReviewDate)) {
          leastReviewDate = reviewDate;
        }
      }
    });

    if (!leastReviewDate || leastReviewDate.isBefore(moment())) {
      leastReviewDate = moment();
    }
    const ngbLeastReviewDate = ngbDateFromMoment(leastReviewDate);

    if (formModel?.values?.callBack=='') {
        let lrd = ngbDateFromObject(ngbLeastReviewDate);
        formModel.setValues({'callBackDate':moment(lrd).format('DD/MM/yyyy')})
    }
  };


const setDisposition = (outcomeVal) => {

if (outcomeVal[0]) {
  const {optionKey,value}=outcomeVal[0];
 let SpokenTo='';
 if (outcomeFormData) {
  setActionCode(outcomeFormData[value]['ctaActionCode']);
  setDiallerDisposition(outcomeFormData[value]['dailerDisposition']);
  setContactType(outcomeFormData[value]['contactType']);
  setGceExclude(outcomeFormData[value]['gceExclude']);
  setExpiration(outcomeFormData[value]['maxDays']);
  setTerminationCode(outcomeFormData[value]['terminationCode']);
  setGceReason(outcomeFormData[value]['gcereasonCode']);
  setContactSummGrp(outcomeFormData[value]['contactSummaryGroup']);
 }

  let updatedValues={...formModel.values};
  if (value==='CLBK') {
    SpokenTo='C1'
    //accountDetail.cbSchTime
  }
  if (['AM', 'MSGL', 'UVER'].includes(value)) {
    setSpokenTo('NA');
    SpokenTo='NA';
  } else if (['NMRB', 'MSTP'].includes(value)) {
    setSpokenTo('OK');
    SpokenTo='OK';
  }

  const nextWorkDateValue = getNextWorkDate(outcomeFormData[value]);
  if (nextWorkDateValue) {
    setNextWorkDate(nextWorkDateValue);
  } else {
    setNextWorkDate(new Date());
  }
  updatedValues={
    ...updatedValues,
    'LocationCalled':channel,
    'SpokenTo':SpokenTo,
    'InteractionResult':optionKey,
    'NextWorkDate':nextWorkDateValue,
    'callBackType':'2',
    'callBack':'scheduleCallback',
    // 'callBackTime' : '02'
    
  }



  formModel.updateForm({
    values: updatedValues,
    rules: formModel.rules
  });


  
}
 
};
  const buildForm = async () => {
    let finalFields;
    const fields = await fetchFields('CUSTOMER_ACCOUNTS_OUTCOME_MANUAL_UPDATES_FIELDS', 'section');
    finalFields = fields;

    setFields(finalFields && finalFields[0]);
    //setCustomerAccountsManualUpdateForm(qcs.toFormGroup(finalFields[0]));
    const custResponseData = cutomerResponseData;
    setCustResponseData(custResponseData);
    const accounts = custResponseData['accounts'];
    const accountSelected = getaccountSelected;
    
    let searchedAccount;
    if (getaccountSelected) {
      searchedAccount = getaccountSelected;
    } else {
      //searchedAccount = accountSelected.getData();
    }

    let count = 1;
    const updatedAccounts = [];
    const updatedSelectedAccount = [];
    accounts.forEach(element => {
      if (element.status === "D") {
        //const maskedAccountNumber = numberFormat.transform(element["accountNumber"], "xxxx xxxx xxxx 1234");
       // element.maskedAccountNumber = maskedAccountNumber;
        if (element.accountNumber === searchedAccount['accountNumber']) {
          setSelectedClass(count);
          updatedSelectedAccount.push(element);
        }
        count++;
        updatedAccounts.push(element);
      }
    });
    setCustomerAccounts(updatedAccounts);
    setSelectedAccount(updatedSelectedAccount);
  };

const ngOnInit=async ()=> {
  let accountDetail;
  let accSubscription = accountListAcc.data.data;
    if (accSubscription && accSubscription['successFlag']) {
      accSubscription = accountListAcc.data.data;
      accountDetail = accSubscription['customer']['accounts'][0];
      setAccountDetail(accountDetail);
    }
    //formModel.setValues({'callBackTime':moment(lrd).format('DD/MM/yyyy')})cbSchTime
  
  let functions = getAuthorizedProductFunctions;

  found = functions.find(element => element.functionName == "REAL_TIME_EXCLUSION");

  // custResponseData = custResponseData;

  // START - CCSN-7315 Callback Alvaria API integration changes
  let entity = getAuthorizedEntityFunctions.forms;

  let alvariaEnabled = entity.find(element => element.formName == "CUSTOMER_OUTCOME_CALLBACK").fields.find(field => field.fieldKey == "enableCallbackAlvaria").value == 'true' ? true : false;

  // START: CCSN-5291 fix to use sorted account list based on searched account
  let accountSelected = getaccountSelected;

  let searchedAccount;
  if (accountSelected) {
    if (accountSelected) {
      searchedAccount = accountSelected;
    } else {
      searchedAccount = accountSelected;
    }
  }

  let sortedAccounts = [];
  custResponseData['accounts'].forEach(account => {
    if (account['accountNumber'] === searchedAccount['accountNumber']) {
      sortedAccounts.unshift(account);
    } else {
      sortedAccounts.push(account);
    }
  });
  custResponseData['accounts'] = sortedAccounts;
  // END: CCSN-5291 fix to use sorted account list based on searched account

  // custResponseData = customerBannerService.getCustomerResponseDetails();
  let otherOutcomesFields;
  let otherOutcomesControlFields;
  let callbackFields;
  let checklist=[];


  const fetchData = async () => {
    try {
      // Fetch all forms concurrently
      const [
        custOverviewMostCommonOutcomeFields,
        otherOutcomesFields,
        otherOutcomesControlFields,
        callbackFieldsResponse,
      ] = await Promise.all([
        buildForm1(),
        buildForm2(),
        buildForm3(),
        buildFormCallback(),
      ]);

      // Process callback fields
      let callbackFields = callbackFieldsResponse;
      if (!alvariaEnabled) {
        callbackFields = callbackFields.filter(
          (field) => field.key !== "callBackProductType" && field.key !== "callBack"
        );
      }
      setCallBckForm(callbackFields);

      // Process customer response data
      custResponseData["accounts"]
        .filter((account) => account.status !== "C")
        .forEach((account) => {
          checklist.push({
            accountNumber: account["accountNumber"],
            accountOrg: account["accountOrg"],
          });

          // Initialize accounts with PTP
          const ptpTaken = Number(account["openPtpAmount"]) > 0;
          const reviewDate = moment(account["reviewDate"], "DD MMM YYYY").format("MMDDYYYY");
          // accountDetailsService.addAccount(account["accountNumber"], account["accountOrg"], reviewDate, ptpTaken);
        });

      // Additional logic for outcomes (if needed)
      if (otherOutcomesFields) {
        // Process otherOutcomesFields here
      }

      // Fetch disposition
      getDisposition();
      // listenForOutcome(); // Uncomment if needed
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData();
  // // START - CCSN-311 get accounts with updated next work date.
   const subscription10 = await getaccountDetailsData()
    setAccountsWithUpdates(subscription10);
     getLeastReviewDate();
    buildForm();
  
  let showReScheduleCallbackButton = true;
    if (props.status == 'reScheduleCall'){
      setisCallBack(true);
       formModel.setValues({'InteractionResult':'CLBK'});

      // let cbCallbackId = accountDetail && accountDetail.cbCallbackId;


      let productTypeOptions =callbackFields && callbackFields.find(field => field.fieldKey == "callBackProductType").fieldOptions.find(option => option.optionValue == accountDetail.cbGenProdType);
      if(productTypeOptions && productTypeOptions.length != 0){
      formModel.setValues({'callBackProductType':accountDetail.cbGenProdType});
        // callbackForm.get('callBackProductType').setValue(accountDetail.cbGenProdType);
      }

      formModel.setValues({'callBackType':accountDetail.cbType});
      formModel.setValues({'callBackTime':accountDetail.cbSchTime});
      formModel.setValues({'callBackPhoneType':accountDetail.cbPhType});
      formModel.setValues({'callBackNotes':accountDetail.cbNotes});
      setTimeout(() => {
        let momentDate = moment(accountDetail.cbSchDate, 'DD MMM YYYY').format('YYYY-M-D').split('-');
        let dateObj ={};
        dateObj['year'] = momentDate[0];
        dateObj['month'] = momentDate[1];
        dateObj['day'] = momentDate[2];
        // callbackForm.get('callBackDate').setValue(ngbDateFromObject(dateObj), { emitEvent: false });
        let reviewDate = moment(accountDetail.reviewDate, 'DD MMM YYYY').format('YYYY-M-D').split('-');
        let reviewDateObj = {};
        reviewDateObj['year'] = reviewDate[0];
        reviewDateObj['month'] = reviewDate[1];
        reviewDateObj['day'] = reviewDate[2];

        const formattedDate = moment(`${reviewDateObj.year}-${reviewDateObj.month}-${reviewDateObj.day}`, 'YYYY-M-D').format('DD/MM/yyyy');

        formModel.setValues({'NextWorkDate':formattedDate});
        // callbackForm.get('callBackPhone').setValue(accountDetail.cbPhone);
      }, 0);

      const fetchPaymentAmountsFields = async () => {
        try {
          const fields = await fetchFields("CUSTOMER_OVERVIEW_OUTCOME", "controlSection");
          setPaymentAmmountsFields([fields[0][0]]);
        } catch (error) {
          console.error("Error fetching payment amounts fields:", error);
        }
      };
  
      fetchPaymentAmountsFields();
    } else if (props.status == 'cancelCall'){
      if (showReScheduleCallbackButton){
        showReScheduleCallbackButton = false;
        getLeastReviewDate();
        formModel.setValues({'callBackType':'2'});

      }
    }
  //});
  // END - CCSN-7315 Callback Alvaria API integration changes
}

  //<END> - Story CCSN-1997 gdx changes done 26 April 2021 by <44125992><END>

  const formatDate=(dateValue) =>{
    let value = dateValue;
    if (value) {
      if (value['month'] < 10) {
        value = value['month'].toString();
        if (value.length < 2) {
          dateValue['month'] = "0" + dateValue['month'];
        }
      }
      value = dateValue;
      if (value['day'] < 10) {
        value = value['day'].toString();
        if (value.length < 2) {
          dateValue['day'] = "0" + dateValue['day'];
        }
      }
      return dateValue['month'] + "/" + dateValue['day'] + "/" + dateValue['year'];
    }
    return "";
  }

  // CCSN-311 callback added function to convert date from ngbdate to MMDDYYYY
  const formatDateForBackendRequest=(dateValue)=> {
    const date = formatDate(dateValue);
    return date.split('/').join('');
  }
  const onManualOutcomeUpdate = (e) => {

    // outcomeForm.updateValueAndValidity();
    if ((formModel.valid && selIntRes === "CLBK") || selIntRes !== "CLBK") {
      const userDetails = getUserDetails();
      const newReviewDateAccount = [];
      const newExcludeAccounts = [];
      console.log("custResponseData.............",custResponseData);
      custResponseData['accounts'].forEach(account => {
        if (account.status !== "C") {
          const openPtpAmount = account['openPtpAmount'];
          let reviewDt = account['reviewDate'];
          const nextWorkDateAccount = accountsWithUpdates.find(a => a.accountNumber === account.accountNumber && a.org === account.accountOrg);
          if (nextWorkDateAccount && nextWorkDateAccount.nextWorkDate) {
            reviewDt = moment(nextWorkDateAccount.nextWorkDate, 'MMDDYYYY').format('DD MMM YYYY');
          }
          const reviewDate = new Date(reviewDt);
          const nextWorkDate = new Date(formModel.values.NextWorkDate);

          if (callbackCode && nextWorkDate > reviewDate && (0 < Number(openPtpAmount) || (nextWorkDateAccount && nextWorkDateAccount.ptpTaken))) {
            const maskedAccountNumber = NumberFormat(account["accountNumber"], "xxxx xxxx xxxx 1234");
            newReviewDateAccount.push({
              "accountNumber": account["accountNumber"],
              "maskedAccountNumber": maskedAccountNumber,
              "accountOrg": account["accountOrg"],
              "reviewDate": reviewDt,
              "nextWorkDate": formModel.values.NextWorkDate
            });
          } else if (nextWorkDate < reviewDate && (0 < Number(openPtpAmount) || (nextWorkDateAccount && nextWorkDateAccount.ptpTaken))) {
            const maskedAccountNumber = NumberFormat(account["accountNumber"], "xxxx xxxx xxxx 1234");
            newReviewDateAccount.push({
              "accountNumber": account["accountNumber"],
              "maskedAccountNumber": maskedAccountNumber,
              "accountOrg": account["accountOrg"],
              "reviewDate": reviewDt,
              "nextWorkDate": formModel.values.NextWorkDate
            });
          } else {
            newExcludeAccounts.push({
              "accountNumber": account["accountNumber"],
              "accountOrg": account["accountOrg"],
              "nextWorkDate": formModel.values.NextWorkDate
            });
          }
        }
      });

      setReviewDateAccount(newReviewDateAccount);
      setExcludeAccounts(newExcludeAccounts);
      if (e === "Manual Update") {
        // ManualUpdate.dataToggle(userDetails, custResponseData, formModel);
      } else {
        if (newReviewDateAccount.length > 0) {
          // CustomerReviewDate.showModal(newReviewDateAccount);
        } else {
          updateCustomer("");
        }
      }
    }
  };
  const onButtonGroupClick = (event,element) => {


    // formModel.setValues({ 'callBackTime': "4" });


    const value = element?.fieldOptions.filter(item => item?.label === event);

    formModel.setValues({'LocationCalled': value});
    const targetId =value[0]?.optionKey || '';

    if (targetId === 'NOAW' || targetId === 'BUSY') {
      formModel.setValues({'SpokenTo': 'NA'});

      setIsPtpSelected(true);
    } else {
      setIsPtpSelected(false);
    }

    selIntRes= targetId;

    // START: CCSN-311 Defaulting SpokenType and callBackType
    if (targetId === 'CLBK') {
      formModel.setValues({'SpokenTo': 'C1'});
      formModel.setValues({'callBackType': '2'});
    }
    // END: CCSN-311 Defaulting SpokenType and callBackType

    if (targetId === 'PTP') {
      setIsPtpSelected(true);
      // document.querySelector("[name='updateAllDiv']").classList.add('disabled');
      // document.querySelector("[name='manualUpdateDiv']").classList.add('disabled');
    } else {
      // document.querySelector("[name='updateAllDiv']").classList.remove('disabled');
      // document.querySelector("[name='manualUpdateDiv']").classList.remove('disabled');
    }

    // START - Changes for CCSN-6969 - Interaction Tab Result
    // START - Changes for CCSN-9297 - ANM and ALM Story
    const quickBtnOutcomes = ['AM', 'MSGL', 'NMRB', 'MSTP', 'UVER'];
    if (quickBtnOutcomes.includes(targetId)) {
      setTriggerCallDispose(true);
      onManualOutcomeUpdate(event);
    }
    // END - Changes for CCSN-9297 - ANM and ALM Story
    // END - Changes for CCSN-6969 - Interaction Tab Result
  };

  const updateCustomer = (action)=> {
    if (action && action === "cancel") {
      setchecklist(excludeAccounts);
    }
    else if (action && action !== "cancel") {
      excludeAccounts.forEach(acc => {
        action.push(acc);
      });
      setchecklist(action);
    }
    else {
      setchecklist(excludeAccounts);
    }
    entitlementCheck();
  }
  const entitlementCheck= () => {
    let arOrgs = selectedgetAOrgs?.responseData;
    let groupid;
    if (arOrgs) {
      arOrgs.forEach(element => {
        if (element['ar_org'] == custResponseData['accounts']['0']['accountOrg']) {
          groupid = element['group_id'];
        }
      });
    }

    if ((groupid != null && groupid != undefined && groupid != "") && (found != null || found != undefined)) {
      if (expiration && parseInt(expiration) > 0 && gceExclude != "N") {
        // START - CCSN-7315 Callback Alvaria API integration changes
        triggerU02("1"); // Changing the deltaDstInd value to 1
      }
      else {
        triggerU02("1");
      }
    }
    else {
      triggerU02("");
    }
  }
const triggerU02 = (deltaDestInd)=> {

// setErrorMessage("");
// setDisplayMessages([]);

const reasonCode = gceReason || 'GCEMANUAL';
const userDetails = {
  "userId": "V54491",
  "countryCode": "UKRB",
  "mode": "DH",
  "countryID": "41"
};
const user = {
  "userId": "V54491",
  "peoplesoftId": "45354491",
  "countryCode": "UKRB",
  "mode": "DH",
  "countryID": "41"
};
const outcome = formModel.values;
let apiEndpointName = 'outcomeUpdate';
let callbackRequest = {};

let intradayCallback = false;
if (callbackCode) {
  apiEndpointName = 'callbackUpdate';
  const cb = callbackForm.getRawValue();

  const cbShDate = formatDateForBackendRequest(cb.callBackDate);
  const selectedProductType = productTypeList.find((product) => product.value === cb.callBackProductType) || {};

  const customerInfo = customerBannerService.getActiveCustomerInfo();
  const secondaryCustomerDetails = customerBannerService.getcustomerDetails();
  let secondaryCustomerName = '';
  secondaryCustomerDetails.forEach(customer => {
    if (customer.cin === accountSelected.data.cin2) {
      secondaryCustomerName = customer.name;
    }
  });

  let notes = '';
  if (immediateCallbackEnabled) {
    callbackService.setimmediateCallback(false);
  } else {
    callbackService.setimmediateCallback(true);
  }
  if (cb.callBackNotes) {
    notes = cb.callBackNotes.toUpperCase();
  }
  const callBackPhone = cb.callBackPhone.replace(/\s/g, "");

  callbackRequest = {
    outcome: callbackCode,
    operation: 'callback_Update',
    deltaDestInd: '1',
    callBackType: cb.callBackType,
    callBackTime: cb.callBackTime,
    callBackDate: cbShDate,
    phoneType: cb.callBackPhoneType,
    callBackPhone: callBackPhone,
    callBackStatus: showReScheduleCallbackButton ? 'R' : 'S',
    callBackNotes: notes,
    immediateCallbackEnabled: immediateCallbackEnabled,
    alvariaEnabled: alvariaEnabled,
    productCode: selectedProductType.product || '',
    leadCustomerName: customerInfo.customerName,
    callbackId: cbCallbackId,
    cliRecord: selectedProductType.cli || '',
    genProdType: cb.callBackProductType,
    callbackAddOnTime: cb.bufferImdCallback,
    customerNumber: customerInfo.customerNumber,
    secondaryCustomerName: secondaryCustomerName
  };

  if (cbShDate === moment().format('MMDDYYYY')) {
    intradayCallback = true;
    // TODO: CALL ASPECT API FOR INTRA DAY CALLBACK
  }
}

const searchedAccount = custResponseData['accounts']['0']['accountNumber'];
const org = custResponseData['accounts']['0']['accountOrg'];

const outcomeRequest = {
  locationCalled: outcome.LocationCalled,
  speakingTo: outcome.SpokenTo,
  outcome: outcome.OtherOutcome,
  org: org,
  racfId: userDetails.userId,
  psId: user.peoplesoftId,
  country: userDetails.countryCode,
  searchType: "A",
  operation: "outcome_Update",
  searchedAccount: searchedAccount,
  accountList: checklist,
  ccsId: "0000000000000037",
  actionCode: actionCode,
  contactType: contactType,
  deltaDestInd: deltaDestInd,
  exclusionReason: reasonCode,
  contactSummGrp: contactSummGrp,
  customerInd:  1//removed need to check this customerBannerService.getActiveBannerIndex() +
};

const body = { ...outcomeRequest, ...callbackRequest };

if (checklist.length !== 0) {
 
  }
}
  // START: CCSN-311 callback implementation
  const buildFormCallback = async () => {
    try {
      const fields = await fetchFields('CUSTOMER_OUTCOME_CALLBACK', 'callbackSection');
      let cbFields = fields[0];
      console.log("cbFields.........", cbFields);

      const data = accountListAcc?.data?.data?.customer;
      getContactDetails(data);

      if (cbFields) {
        cbFields.forEach((element) => {
          // Handle 'filterSelect' field type
          if (element.fieldType === 'filterSelect') {
            if (element.fieldKey === 'callBackPhoneType') {
              const productIndicator = data?.accounts?.[0]?.productIndicator;
              const phoneCodes =
                cardFlag === 'C'
                  ? cardPhoneCodes
                  : ['430', '431'].includes(productIndicator)
                  ? bizPhoneCodes
                  : retailPhoneCodes;

              phoneCodes.forEach((el) => {
                element.fieldOptions.push({ key: el.key, value: el.key, label: el.label });
              });
            } else if (element.fieldKey === 'callBackProductType' && data) {
              const productIndicator = data.accounts?.[0]?.productIndicator;
              const pvcIndicator = data.pvcIndicator === 'Y';
              const classification = data.accounts?.[0]?.classification;

              element.fieldOptions = prepareProductTypeList(productIndicator, pvcIndicator, classification);
            } else {
              element.fieldOptions.forEach((subelement) => {
                subelement.value = element.fieldKey;
              });
            }
          }

          // Handle 'callBackDate' field key
          if (element.fieldKey === 'callBackDate' && element.maxDate) {
            const maxMomentDate = moment()
              .add(Number(custResponseData.callbackMaxDays), 'days')
              .format('YYYY-M-D')
              .split('-');
            element.maxDate = `{ "year": ${maxMomentDate[0]}, "month": ${maxMomentDate[1]}, "day": ${maxMomentDate[2]} }`;
          }

          // Handle 'callBackTime' field key
          if (element.fieldKey === 'callBackTime') {
            const minHours = element.fieldValidations.find((v) => v.fieldValidation === 'minHours')?.fieldValidationConstraint;
            const maxHours = element.fieldValidations.find((v) => v.fieldValidation === 'maxHours')?.fieldValidationConstraint;

            element.minHours = minHours;
            element.maxHours = maxHours;
          }

          // General handling for field options
          if (element.fieldKey) {
            element.fieldOptions.forEach((subelement) => {
              if (subelement.optionValue) {
                subelement.value = subelement.optionValue;
                subelement.key = subelement.optionKey;
                subelement.label = subelement.optionName;
              }
            });
          }
        });
      }

      return cbFields;
    } catch (error) {
      console.error("Error in buildFormCallback:", error);
      throw error;
    }
  };

    const getInteractionResultValues = (fields, isAdd) => {
      let removedOptions = [];
      console.log(".....delinquentDemographics......", delinquentDemographics);

      const data = delinquentDemographics?.data;
      if (data) {
        const { cust2HomePhone: otherPhone, cust1HomePhone: homePhone1, cust1WorkPhone: workPhone1, cust1MobilePhone: mobilePhone1 } = data;

        fields.forEach((element) => {
          element.fieldOptions.forEach((subelement) => {
            subelement.value = subelement.optionKey;
          });

          if (element.fieldKey === "LocationCalled") {
            element.fieldOptions.forEach((subelement, i) => {
              switch (subelement.optionValue) {
                case "H1":
                  subelement.label = homePhone1 ? `Home: ${homePhone1}` : "Home";
                  break;
                case "M1":
                  subelement.label = mobilePhone1 ? `Mobile: ${mobilePhone1}` : "Mobile";
                  break;
                case "W1":
                  subelement.label = workPhone1 ? `Work: ${workPhone1}` : "Work";
                  break;
                case "O":
                  subelement.label = "Other";
                  break;
                case "I":
                  subelement.label = "Inbound";
                  break;
                case "D":
                  subelement.label = "Digital Chat";
                  break;
                case "MW":
                  subelement.label = "Manual Work";
                  break;
                default:
                  if (["H1", "M1", "W1", "H2", "M2", "W2", "BP", "BM"].includes(subelement.optionValue)) {
                    removedOptions.push(element.fieldOptions[i]);
                  } else {
                    subelement.label = `${subelement.label}`;
                  }
                  break;
              }
            });
          } else {
            element.fieldOptions.forEach((subelement) => {
              subelement.value = subelement.optionKey;
              subelement.label = subelement.optionKey;
            });
          }
        });
      }

      if (!isAdd) {
        setInteractionFields(fields);
      }

      buildDropDownValues(fields, removedOptions);
    };

    const  buildDropDownValues = (fields, rem) => {
        //<START> - location called dropdown uit CCSN-3253 fix 12th april 2021 by <44125992><START>
        fields.forEach((el, index) => {
          if (el.fieldKey == 'LocationCalled') {
            fields[index].fieldOptions = el.fieldOptions.filter(o => !rem.find(o2 => o.optionKey === o2.optionKey));
          }
        });
        //setInteractionFields(fields);
        buildPtpButtonGroup();
        //<END> - location called dropdown uit CCSN-3253 fix 12th april 2021 by <44125992><END>
      }
      const addFieldsToFormModel = (response, isadd) => {

        // Add or update validations for fields present in the latest response
        response.forEach(field => {
          formModel.values[field.fieldKey] = field.fieldValue || '';

          const validations = field.fieldValidations.map(validation => {
            switch (validation.fieldValidation) {
              case 'required':
                return val => !!val || `${field.fieldLabel} is required`;
              case 'minlength':
                return val => val?.length >= validation.fieldValidationConstraint || `${field.fieldLabel} must be at least ${validation.fieldValidationConstraint} characters`;
              case 'maxlength':
                return val => val?.length <= validation.fieldValidationConstraint || `${field.fieldLabel} must be at most ${validation.fieldValidationConstraint} characters`;
              case 'pattern':
                return val => new RegExp(validation.fieldValidationConstraint).test(val) || `${field.fieldLabel} is invalid`;
              // Add more cases as needed for other validation types
              default:
                return () => true;
            }
          });

          if (isadd) {
            formModel.rules[field.fieldKey] = validations;
          } else {
            // Filter out all validations except for 'required'
            const requiredValidation = validations.filter(validation => validation.toString().includes('is required'));
            formModel.rules[field.fieldKey] = requiredValidation;

                    // Create a set of field keys from the response
            const responseFieldKeys = new Set(response.map(field => field.fieldKey));

            // Remove validations for fields not present in the latest response
            Object.keys({...formModel.rules}).forEach(fieldKey => {
              if (!responseFieldKeys.has(fieldKey)) {
                formModel.rules[fieldKey] = [];
              }
            });
          }
        });
        // Update the form model with the new values and rules
        formModel.updateForm({
          values: {...formModel.values, ...formModel.values},
          rules: formModel.rules
        });
        return formModel;
      };
      
  const buildForm1= ()=> {
    let finalFields;
    return new Promise((resolve, reject) => {
      fetchFields('CUSTOMER_OVERVIEW_OUTCOME','mostCommonOutcomeSection')
        .then(fields => {
          const custOverviewMostCommonOutcomeFields = fields[0];
          custOverviewMostCommonOutcomeFields.forEach(element => {
            if (element.type === 'button_group') {
              element.options.forEach(subelement => {
                subelement.value = 'OtherOutcome';
              });
            }
          });
          
          resolve(custOverviewMostCommonOutcomeFields);
        });
    });
  }

  const buildForm2 = async () => {
    //<START> - Story ccsn-1608 Changes done 16th March 2021 by <44125992><START>
    const arOrgs = selectedgetAOrgs?.responseData;
    const accountDetails = accountListAcc?.data?.data;

    if (arOrgs && accountDetails) {
      const matchingOrg = arOrgs.find(
        (element) =>
          element['ar_org'] === accountDetails['customer']['accounts']['0']['productIndicator']
      );
      if (matchingOrg) {
        groupid = matchingOrg['group_id'];
        cardFlag = matchingOrg['account_type'];
      }
    }

    try {
      const [fields, fields1] = await Promise.all([
        fetchFields('CUSTOMER_OVERVIEW_OUTCOME', 'otherOutcomeSection'),
        fetchFields('CUSTOMER_OVERVIEW_OUTCOME', 'businessSection'),
      ]);

      const data = delinquentDemographics?.data;
      getContactDetails(data); // CCSN-311 contact details refactored

      const finalFields = fields[0];
      const businessFields = fields1[0];

      const updatedFields = finalFields.map((el) => {
        if (el.key === 'LocationCalled') {
          el.options = el.options.filter(
            (o) => !removed.some((o2) => o.key === o2.key)
          );
        }
        return el;
      });

      console.log('else..........cardFlag', cardFlag);

      if (cardFlag !== 'C') {
        retailNumbers(data, businessFields, updatedFields);
      } else {
        cardNumbers(businessFields, finalFields);
      }

      return updatedFields;
    } catch (error) {
      console.error('Error in buildForm2:', error);
      throw error;
    }
  };

const cardNumbers=(businessFields,updatedFields)=>{
  //console.log("cardNumbers........",otherOutcomesFields);

 let rem =[];
 let data = delinquentDemographics && delinquentDemographics["data"];
           //<START> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
  if (data) {
    let homePhone1 = data["cust1HomePhone"];
    let workPhone1 = data["cust1WorkPhone"];
    let mobilePhone1 = data["cust1MobilePhone"];
    let homePhone2 = data["cust2HomePhone"];
   
   
     updatedFields.forEach((element, index) => {
       if (element.fieldKey == 'LocationCalled' && element.fieldSection == 'otherOutcomeSection') {
         updatedFields[index] = businessFields[0];
                 // Filter out BP and BM from fieldOptions
        updatedFields[index].fieldOptions = updatedFields[index].fieldOptions.filter(
          (subelement) => subelement.optionValue !== 'BP' && subelement.optionValue !== 'BM'
        );
         updatedFields[index].fieldOptions.forEach((subelement, i) => {
           //<START> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
            subelement.key =subelement.optionValue;
            subelement.value = subelement.optionValue;
   
   
   
           if (subelement.optionValue == 'H1') {
             subelement.label = homePhone1 ? "Home:" + homePhone1 : "Home";
           }
           else if (subelement.optionValue == 'M1') {
             subelement.label = mobilePhone1 ? "Mobile:" + mobilePhone1 : "Mobile";
           }
           else if (subelement.optionValue == 'W1') {
             subelement.label = workPhone1 ? "Work:" + workPhone1 : "Work";
           }
   
           else if (subelement.optionValue == 'O') {
             subelement.label = homePhone2 ? "Other:" + homePhone2 :"Other";
           }
           else if (subelement.optionValue === 'I') {
             subelement.label = 'Inbound';
             //matchPhoneNumber(otherPhone, subelement.value);
           } else if (subelement.optionValue === 'D') {
             subelement.label = 'Digital Chat';
             //matchPhoneNumber(otherPhone, subelement.value);
           } else if (subelement.optionValue === 'MW') {
             subelement.label = 'Manual Work';
             //matchPhoneNumber(otherPhone, subelement.value);
           } 
           else {
             if (['H2', 'M2', 'W2', 'BP', 'BM'].includes(subelement.optionValue)) {
               rem.push(element.fieldOptions.slice(i, i + 1)[0]);
             } else {
               subelement.label = `${subelement.fieldlabel}`;
             }
           }
   
           //<END> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
         });
       }
       else{
         updatedFields[index].fieldOptions.forEach((subelement, i) => {
           subelement.key =subelement.optionValue;
           subelement.value = subelement.optionValue;
           subelement.label = subelement.optionKey;
           });
       }
     
     });
     console.log("updatedFields...........",updatedFields);
     setInteractionFields(updatedFields);
  }

}
  const getContactDetails= (data)=> {
    if (data) {
      // const contacts = data["accounts"][0]["contacts"];
      // homePhone2 = contacts["otherPhone"];
      // workPhone2 = contacts["otherPhone1"];
      // mobilePhone2 = contacts["otherPhone2"];
      // homePhone1 = contacts["homePhone"];
      // workPhone1 = contacts["workPhone"];
      // mobilePhone1 = contacts["mobilePhone"];
      // business1 = contacts["otherPhone3"];
      // business2 = contacts["otherPhone4"];


      //new changes
      // otherPhone =data["cust2HomePhone"];
      //<END> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
      workPhone2 = data["cust2WorkPhone"];
      mobilePhone2 = data["cust2MobilePhone"];
      // homePhone1 = data["cust1HomePhone"];
      // workPhone1 = data["cust1WorkPhone"];
      // mobilePhone1 = data["cust1MobilePhone"];
      business1 = data["businessCustBusinessPhone"];
      business2 = data["businessCustMobilePhone"];
    }
  }
  let   phoneMatchedIdentifier = '';
  const matchPhoneNumber=(number, identifier) =>{
    //harish ... modified .. let eLinqPhoneNumber = sessionStorage.getItem('eLinqReceivedPhoneNumber');
    let eLinqPhoneNumber = sessionStorage.getItem('eLinqReceivedPhoneNumber');
    if (number && eLinqPhoneNumber && number.match(eLinqPhoneNumber) && !phoneMatchedIdentifier) {
      phoneMatchedIdentifier = identifier;
    }
  }
  const getDisposition = async () =>{
    // START, CCSN-5284 -  Retrofit GA2.0 changes - Disposition placed in Shared Service -  <45025299>
    const dispositionData = await getDispositionCodes();
    
    // START, CCSN-5284 -  Retrofit GA2.0 changes - Disposition placed in Shared Service -  <45025299>
    if (dispositionData) {
      setoutcomeFormData(dispositionData['dispositionCodeMapping']);
    }
  }
  const businessAccounts = (businessFields,updatedFields)=> {

    updatedFields.forEach((element, index) => {
      if (element.fieldKey == 'LocationCalled' && element.fieldSection == 'otherOutcomeSection') {
        updatedFields[index] = businessFields[0];
        updatedFields[index].fieldOptions.forEach((subelement, i) => {
          //<START> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
          subelement.key =subelement.optionValue;
          subelement.value = subelement.optionValue;
          if (subelement.optionValue == 'BP') {
            subelement.label = business1 ? "Business Primary-Home:" + business1 : "Business Primary-Home";
            // subelement.label="Business Primary-Home:"+business1;
            matchPhoneNumber(business1, subelement.optionValue);
          }
          else if (subelement.optionValue == 'BM') {
            subelement.label = business2 ? "Business Primary-Mobile:" + business2 : "Business Primary-Mobile";
            //subelement.label="Business Primary-Mobile:"+business2;
            matchPhoneNumber(business2, subelement.optionValue);
          }
          else if (subelement.optionValue == 'O') {
            //subelement.label="Business Primary-Mobile:"+business2;
            subelement.label = "Other";
            matchPhoneNumber(homePhone2, subelement.optionValue);
          }
          else if (subelement.optionValue === 'I') {
            subelement.label = 'Inbound';
            //matchPhoneNumber(otherPhone, subelement.value);
          } else if (subelement.optionValue === 'D') {
            subelement.label = 'Digital Chat';
            //matchPhoneNumber(otherPhone, subelement.value);
          } else if (subelement.optionValue === 'MW') {
            subelement.label = 'Manual Work';
            //matchPhoneNumber(otherPhone, subelement.value);
          } 
          else {
            if (subelement.optionValue == 'BP' || subelement.optionValue == 'O' || subelement.optionValue == 'BM') {
              removed.push(updatedFields[index].fieldOptions.slice(i, i + 1)[0]);
            }
            else {
              subelement.label = element.fieldKey;
            }
          }

          //<END> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
        });
      }
      else if ((element.fieldKey == 'SpokenTo' || element.fieldKey == 'InteractionResult') && element.fieldSection == 'otherOutcomeSection') {
        updatedFields[index].fieldOptions.forEach((subelement, i) => {

        subelement.key =subelement.optionValue;
        subelement.value = subelement.optionValue;
        // if (getDispositionCodes['dispositionCodeMapping'][subelement.optionKey]) {
        //   subelement.label = getDispositionCodes['dispositionCodeMapping'][subelement.optionKey].description;

        // }
        // else{
          if (element.fieldKey == 'SpokenTo' ) {
            subelement.label = subelement.optionKey;
          }
          else {
            subelement.label = subelement.optionKey;
          }


        // }
        });
      }
    
    });
    setInteractionFields(updatedFields);
  }
  const buildForm3=()=> {
    let finalFields;
    return new Promise((resolve, reject) => {
      fetchFields('CUSTOMER_OVERVIEW_OUTCOME','controlSection').then(fields => {
          finalFields = fields[0];
          otherOutcomesControlFields = finalFields[0];
          resolve(otherOutcomesControlFields);
        });
    });
  }
  const retailNumbers=(data, businessFields,updatedFields)=> {
    console.log("else.............",otherOutcomeSection);

    const AccountDetails =fetchAccountDetail.data.data.customer;
    //added 002 Org , in FD CTA ORG 002 Equal to RB CTA Org 431
    if (AccountDetails && AccountDetails["accounts"][0]['productIndicator'] == '430' || AccountDetails && AccountDetails["accounts"][0]['productIndicator'] == '431' || AccountDetails && AccountDetails["accounts"][0]['productIndicator'] == '002') {
      businessAccounts(businessFields,updatedFields);
    }
    else {
      console.log("else.............",otherOutcomeSection);
      otherOutcomeSection.forEach((element, index) => {
        console.log("else..............element..........",element);
        if (element.key == 'LocationCalled') {
          // START - CCSN-6000 for single customer retail: customer2 options removed in locationCalled by 45063962 - 28 Sept 2021
          // let customerList: Array<any> = customerBannerService.getCustomerList();
          let customerList=[
            "1000111920",
            "1203790295"
          ]
          let options, filteredOptions;
          options = otherOutcomeSection[index].options;
          if (customerList.length == 1 && options) {
            filteredOptions = options.filter(obj => (obj.value != 'H2' && obj.value != 'M2' && obj.value != 'W2'));
          } else {
            filteredOptions = options;
          }
          filteredOptions.forEach((subelement, i) => {
            // END - CCSN-6000 for single customer retail: customer2 options removed in locationCalled by 45063962 - 28 Sept 2021
            //<START> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
            if (subelement.value == 'H1') {
              subelement.label = homePhone1 ? "Customer 1-Home:" + homePhone1 : "Customer 1-Home";
              //subelement.label="Customer 1-Home:"+homePhone1;
              matchPhoneNumber(homePhone1, subelement.value);
            }
            else if (subelement.value == 'M1') {
              subelement.label = mobilePhone1 ? "Customer 1-Mobile:" + mobilePhone1 : "Customer 1-Mobile";
              //subelement.label="Customer 1-Mobile:"+mobilePhone1;
              matchPhoneNumber(mobilePhone1, subelement.value);
            }
            else if (subelement.value == 'W1') {
              subelement.label = workPhone1 ? "Customer 1-Work:" + workPhone1 : "Customer 1-Work";
              // subelement.label="Customer 1-Work:"+workPhone1;
              matchPhoneNumber(workPhone1, subelement.value);
            }
            else if (subelement.value == 'H2') {
              subelement.label = homePhone2 ? "Customer 2-Home:" + homePhone2 : "Customer 2-Home";
              // subelement.label="Customer 2-Home:"+ homePhone2;
              matchPhoneNumber(homePhone2, subelement.value);
            }
            else if (subelement.value == 'M2') {
              subelement.label = mobilePhone2 ? "Customer 2-Mobile:" + mobilePhone2 : "Customer 2-Mobile";
              // subelement.label="Customer 2-Mobile:"+mobilePhone2;
              matchPhoneNumber(mobilePhone2, subelement.value);
            }
            else if (subelement.value == 'W2') {
              subelement.label = workPhone2 ? "Customer 2-Work:" + workPhone2 : "Customer 2-Work";
              //subelement.label="Customer 2-Work:"+workPhone2;
              matchPhoneNumber(workPhone2, subelement.value);
            }
            else if (subelement.value == 'O') {
              subelement.label = "Other";
              // subelement.label="Customer 2-Work:"+workPhone2;
              matchPhoneNumber(homePhone2, subelement.value);
            }
            else {
              if (subelement.value == 'H1' || subelement.value == 'M1' || subelement.value == 'W1' ||
                subelement.value == 'H2' || subelement.value == 'O' || subelement.value == 'M2' || subelement.value == 'W2') {
                removed.push(otherOutcomeSection[index].options.slice(i, i + 1)[0]);
              }
              else {
                subelement.label = element.key;
              }
            }
            //<END> - UKRB_SIT_Outcome_Action history  CCSN-5295 fix by <45025299>
          });
          otherOutcomeSection[index].options = filteredOptions;
        }
        else {
          element.options.forEach(subelement => {
            subelement.value = element.key;
          });
        }
      });
    }
  }
const handleModalPopup = (info) => {
  return (
    <ModalDialog
      title={NLS`ChooseAccountLabel`}
      onClose={() => setShow(false)}
      getApplicationNode={() => document.getElementById('root')}
      width={1000}
      show={show}
      dismissible={false}
    >
      {({ closeDialog }) => (
        <Row>
          <Cell size={12}>
            <Text>{NLS`AccountsMessage`}</Text>
          </Cell>
          <Cell size={12} style={{ marginTop: 24 }}>
            <div className={styles.Accountsscroll}>
              <Field name={'0'}>
                <Checkbox
                  label={NLS`AllAccounts`}
                  checked={isSelectAllChecked || false}
                  onChange={() => handleSelectAll()}
                />
              </Field>
              {customerAccounts.map((element) => (
                <Field key={element.accountNumber} name={element.accountNumber}>
                  <Checkbox
                    label={element.accountNumber}
                    checked={selectedAccounts.includes(element.accountNumber)}
                    onChange={() => handleCheckboxChange(element.accountNumber)}
                  />
                </Field>
              ))}
            </div>
            <div className={styles.input}>
              <Button
                onClick={(e) => {
                  Submit(e);
                  closeDialog();
                }}
                label={NLS`UpdateBtn`}
              />
              <Button
                tertiary
                onClick={() => setShow(false)} // Directly handle modal state
                label={NLS`CancelBtn`}
              />
            </div>
          </Cell>
        </Row>
      )}
    </ModalDialog>
  );
};
	const handleClick = useCallback(
    
      (e, element) => {

        console.log("handleClick.......", e, element);
        if (e === "Call Back"){          
        const spokenTo = formModel.values['SpokenTo'];
        const callbackType = formModel.values['callBackType'];

        const outcome = getCodeForCallback(spokenTo, callbackType);
        setOutCome(outcome);


        
        }

        if (element?.fieldKey === "callBackTime") {
          formModel.setValues({callBackTime: e});
      }
        if (formModel?.isValidated) {
        }
        if (formModel.values.LocationCalled !='') {
          setChannel(formModel.values.LocationCalled);
        }
        if (element?.fieldOptions) {
          const value = element?.fieldOptions.filter(item => item?.label === e);
         
          if (element.fieldSection === "mostCommonOutcomeSection") {
            // setStatus('');
            props.status='';
            if (value?.length>0 && value[0]?.value==='CLBK') {
              setisCallBack(true);
              const fields2 = fetchFields("CUSTOMER_OUTCOME_CALLBACK","callbackSection");

              fields2.then((resposeMSG) => { 
                
                addFieldsToFormModel(resposeMSG[0],true);  
                setDisposition(value);

                getInteractionResultValues(resposeMSG[0],true)
                fetchFields("CUSTOMER_OVERVIEW_OUTCOME","controlSection").then((fields) => {
                  const result = [];
                  result.push(fields[0][0])
                  setPaymentAmmountsFields(result);
            
                });
              });
              onButtonGroupClick(e,element);
            }
            else{

              const fields2 = fetchFields("CUSTOMER_OVERVIEW_OUTCOME","otherOutcomeSection");
              fields2.then((resposeMSG) => { 
                addFieldsToFormModel(resposeMSG[0],false);  
                setDisposition(value);
           
                getInteractionResultValues(resposeMSG[0],false)
  
              });
              setisCallBack(false);
              const req = {
                "hsbcLegalEntityCode": "UK",
                "partyIdentifier": "CUST031565656565844",
                "partyEntityCode": "EEEE",
                "updatedBy": "12345678",
                "updatedOn": "2024-02-05T15:50:42Z",
                "updatedByName": "kEXUq",
                "locationCalled": formModel.values['LocationCalled'],
                "speakingTo": formModel.values['SpokenTo'],
                "outcome": "RSAG",
                "searchedAccount": "0000040068863842711",
                "actionCode": actionCode,
                "mrktLevelRealTimeExcusion": true,
                "createdByName": "John",
                "accountList": [
                  {
                    "accountNumber": "0000040068863842711",
                    "nextWorkDate": formModel.values['NextWorkDate'],
                    "productIndicator": "450",
                    "hsbcLegalEntityCode": "UK",
                    "class": "A"
                  }
                ]
              }
              if (formModel.values.LocationCalled !=='') {
                const response = updateInteractionResults(req);
              }
              onButtonGroupClick(e,element);

            }


          } 
        }
      }, [
        formModel
    ]);
    const getCodeForCallback = (spokenTo, callbackType) => {
      let code = "";
      if (callbackType === "1" && spokenTo && ["C1", "C2"].includes(spokenTo)) {
        code = "CBAR";
      } else if (callbackType === "1" && spokenTo && !["C1", "C2"].includes(spokenTo)) {
        code = "CBAT";
      } else if (callbackType === "2" && spokenTo && ["C1", "C2"].includes(spokenTo)) {
        code = "CBGR";
      } else if (callbackType === "2" && spokenTo && !["C1", "C2"].includes(spokenTo)) {
        code = "CBGT";
      }
      return code;
    };

const getFinalAccountList = (accountList, apiResponse) => {
  const apiAccountNumber = apiResponse.data.customerAccount[0]?.accountNumber;

    const filteredAccountList = accountList.filter(
      (account) => account.accountNumber === apiAccountNumber
  );
    return filteredAccountList.length > 0 ? filteredAccountList : accountList;
};
      const onSubmit = useCallback((e) => {
        const formValues = formModel.values;
        const AccountDetails = accountListAcc.data.data;

        let accountNumber = AccountDetails['customer']['accounts']['0']['accountNumber'];
        let org = AccountDetails['customer']['accounts']['0']['accountOrg'];

        const accountList =  [
          {
            "accountNumber": accountNumber,
            "nextWorkDate": formModel.values['NextWorkDate'],
            "productIndicator": org,
            "accountEntityCode": "HRFB", 
            "class": "A"
          },
          {
            "accountNumber": accountNumber,
            "nextWorkDate": formModel.values['NextWorkDate'],
            "productIndicator": org,
            "accountEntityCode": "HRFB", 
            "class": "A"
          }
        ]

        const finalAccountList = getFinalAccountList(accountList, accountListApiResponse);



        if (false){  /// Payload for the ####==> answering Machine

          const req =  {
            "accountEntityCode": "HRFB",            //Country code
            "partyIdentifier": "CUST031565656565844",  
            "partyEntityCode": "EEEE",
            "updatedBy": "12345678",
            "updatedOn": "2024-02-05T15:50:42Z",
            "updatedByName": "yKqJg",
            "locationCalled": formModel.values['LocationCalled'],
            "speakingTo": formModel.values['SpokenTo'],
            "outcome": outcome,
            "searchedAccount": accountNumber,
            "actionCode": "RSAG",                        //from disposition
            "mrktLevelRealTimeExcusion": true,
            "accountList": finalAccountList
          }

        }

        if (false){  /// Payload for the ####==> Call Back

          const req =  {
            "locationCalled": formModel.values['LocationCalled'], 
            "speakingTo": formModel.values['SpokenTo'],   
            "outcome": outcome,
            "org": org,
            "racfId": "S25299",                                 // userdeatails.userId
            "psId": "45025299",                                 // login detials
            "country": "UKRB",                                  // userdeatails.countrycode
            "searchType": "A",                                  // statuc A
            "operation": "callback_Update",                     //satatis
            "searchedAccount": accountNumber,           
            "accountList": [
                {
                    "accountNumber": "0000040052052014076",
                    "accountOrg": "450",
                    "nextWorkDate": "04092025"
                },
                {
                    "accountNumber": "0000040052032013347",
                    "accountOrg": "450",
                    "nextWorkDate": "04092025"
                },
               
            ],
            "ccsId": "0000000000000037",                          // Static Value
            "actionCode": "CBGR",                                 // from getDispositionCodes() Api
            "contactType": "NC",                                  // from getDispositionCodes() Api
            "deltaDestInd": "1",                                  // Based on update customer 
            "exclusionReason": "GCECBA",                          // from getDispositionCodes() Api
            "contactSummGrp": "05",                                // from getDispositionCodes() Api
            "customerInd": 1,                                     // Based on Banner section Index Change
            "callBackType":  formModel.values['callBackType'],
            "callBackTime":  formModel.values['callBackTime'],
            "callBackDate":   formModel.values['callBackDate'],
            "phoneType": "O",
            "callBackPhone":  formModel.values['callBackPhone'],
            "callBackStatus": "S",
            "callBackNotes":  formModel.values['callBackNotes'],
            "immediateCallbackEnabled": false,
            "alvariaEnabled": formModel.values['enableCallbackAlvaria'],
            "productCode": formModel.values['callBackProductType'],
            "leadCustomerName": "test company correspondence name ",
            "callbackId": "",
            "cliRecord": "8000853955",
            "genProdType": "CMBR",
            "callbackAddOnTime": "0",
            "customerNumber": "1000111920",
            "secondaryCustomerName": "Mr. Paul Ernest BerylliumYH",
            "logo": "550"
        }

        }

  
      if (e=='Manual Update') {
        console.log("uncau e......from manual update");
       // buildForm();
         onManualOutcomeUpdate(e);
        setShow(true);
        }
      else{
        const req = {
          "hsbcLegalEntityCode": "UK",
          "partyIdentifier": "CUST031565656565844",
          "partyEntityCode": "EEEE",
          "updatedBy": "12345678",
          "updatedOn": "2024-02-05T15:50:42Z",
          "updatedByName": "kEXUq",
          "locationCalled": formModel.values['LocationCalled'],
          "speakingTo": formModel.values['SpokenTo'],
          "outcome": "RSAG",
          "searchedAccount": "0000040068863842711",
          "actionCode": actionCode,
          "mrktLevelRealTimeExcusion": true,
          "createdByName": "John",
          outcome:outcome,
          "accountList": [
            {
              "accountNumber": "0000040068863842711",
              "nextWorkDate": formModel.values['NextWorkDate'],
              "productIndicator": "450",
              "hsbcLegalEntityCode": "UK",
              "class": "A"
            }
          ]
        }
        handleNotification('success',NLS`SucessNotification`);
        const response = updateInteractionResults(req);
      }
        // Submit finalObject to your API or handle it as needed
      }, [formModel]);
      const [selectedAccounts, setSelectedAccounts] = useState([]);
      const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
    
      const handleSelectAll = () => {
        if (selectedAccounts.length === customerAccounts.length) {
          setSelectedAccounts([]);
        } else {
          setSelectedAccounts(customerAccounts.map(account => account.accountNumber));
        }
      };
    
      const handleCheckboxChange = (accountNumber) => {
        if (selectedAccounts.includes(accountNumber)) {
          setSelectedAccounts(selectedAccounts.filter(account => account !== accountNumber));
        } else {
          setSelectedAccounts([...selectedAccounts, accountNumber]);
        }
      };
      const Submit = ()=>{
        handleNotification('success',NLS`ManualSucessNotification`);
      }

      const handleSubmit = (data) => {
        setReviewDateModalShow(false);
      };
    
      const SelectedLeadAccount = (Account) => {
        // setReviewDateModalShow(false);
        console.log("Account..........",Account);
      };

    return (
        <Form 
          model={formModel} 
          onSubmit={onSubmit} 
          className={styles.marginTop}
        >
          <Row className={styles.controls}>
            <CommonFields fieldConfig={mostCommonOutcomeFields} handleClick={handleClick} />
          </Row>

          <Text>
            <IconStatusInformationOnLight />
            {NLS`Note`}
          </Text>

          <Row className={styles.controls}>
            <CommonFields fieldConfig={interactionFields} handleClick={handleClick} />
          </Row>

          {isCallBack && (
            <Row className={styles.controls}>
              <CommonFields fieldConfig={callBackForm} handleClick={handleClick} />
            </Row>
          )}

          <Row className={styles.controls}>
            <CommonFields 
              fieldConfig={paymentAmmountsFields} 
              isFormValid={formModel?.isValidated || false} 
              handleClick={onSubmit} 
            />
          </Row>

          {show && handleModalPopup()}

          {false && (
            <Row>
              <InformationModalPopup
                show={informationModalShow}
                setShow={setInformationModalShow}
                customerAccounts={customerAccounts}
                onSubmit={SelectedLeadAccount}
              />
            </Row>
          )}
          {/* <Row>
            <Button onClick={() => setReviewDateModalShow(true)}>Open Modal</Button>
            <ReviewDatePopup
              show={reviewDateModalShow}
              setShow={setReviewDateModalShow}
              customerAccounts={[customerAccount]} 
              radioOptions={radioOptions}
              onSubmit={handleSubmit} 
              onCancel={handleCancel} 
            />
            </Row> */}
        </Form>
    );
    };

    export default withNLS(nls)(InteractionResult);
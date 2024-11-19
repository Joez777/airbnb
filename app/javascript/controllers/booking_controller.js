import { Controller } from "@hotwired/stimulus";
import flatpickr from "flatpickr";

export default class extends Controller {
  static targets = [
    "baseFare",
    "checkin",
    "checkout",
    "numberOfNights",
    "serviceFee",
    "totalAmount",
  ];

  SERVICE_FEE_PERCENTAGE = 0.18;
  disableDates = [];

  connect() {
    this.initializeBlockedDates();
    this.initializeCheckinPicker();
    this.updateDetails();
  }

  initializeCheckinPicker() {
    flatpickr(this.checkinTarget, {
      minDate: new Date().fp_incr(1),
      disable: this.disableDates,
      onChange: (selectedDates) => {
        this.initializeCheckoutPicker(selectedDates);
      },
    });
  }

  initializeCheckoutPicker(selectedDates) {
    flatpickr(this.checkoutTarget, {
      minDate: new Date(selectedDates).fp_incr(1),
      disable: this.disableDates,
      onChange: () => {
        this.updateDetails();
      },
    });

    this.checkoutTarget.click(); // เปิดปฏิทิน Check-out โดยอัตโนมัติ
  }

  initializeBlockedDates() {
    const blockedDates = JSON.parse(this.element.dataset.blockedDates || "[]");
    this.disableDates = blockedDates.map(([from, to]) => ({ from, to }));
  }

  updateDetails() {
    const nightsCount = this.numberOfNights;
    const baseFare = this.calculateBaseFare(nightsCount);
    const serviceFee = this.calculateServiceFee(baseFare);
    const totalAmount = this.calculateTotalAmount(baseFare, serviceFee);

    this.numberOfNightsTarget.textContent = nightsCount;
    this.baseFareTarget.textContent = this.formatCurrency(baseFare);
    this.serviceFeeTarget.textContent = this.formatCurrency(serviceFee);
    this.totalAmountTarget.textContent = this.formatCurrency(totalAmount);
  }

  // คำนวณจำนวนคืนที่เข้าพัก
  get numberOfNights() {
    const checkinDate = new Date(this.checkinTarget.value);
    const checkoutDate = new Date(this.checkoutTarget.value);

    if (isNaN(checkinDate) || isNaN(checkoutDate)) return 0;
    return (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
  }

  // คำนวณ Base Fare
  calculateBaseFare(nightsCount) {
    const perNightPrice = parseFloat(this.element.dataset.perNightPrice || 0);
    return parseFloat((nightsCount * perNightPrice).toFixed(2));
  }

  // คำนวณ Service Fee
  calculateServiceFee(baseFare) {
    return parseFloat((baseFare * this.SERVICE_FEE_PERCENTAGE).toFixed(2));
  }

  // คำนวณ Total Amount
  calculateTotalAmount(baseFare, serviceFee) {
    return parseFloat((baseFare + serviceFee).toFixed(2));
  }

  // รูปแบบตัวเลขเป็นสกุลเงิน
  formatCurrency(amount) {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  // ส่งข้อมูลการจองไปยัง URL ที่กำหนด
  reserveProperty(event) {
    event.preventDefault();

    const paramsData = {
      checkin_date: this.checkinTarget.value,
      checkout_date: this.checkoutTarget.value,
    };

    const paramsURL = new URLSearchParams(paramsData).toString();
    const baseURL = event.target.dataset.reservePropertyUrl;

    Turbo.visit(`${baseURL}?${paramsURL}`);
  }
}

class BookingPaymentsController < ApplicationController
  def create
    @property = Property.find(booking_payments_params[:property_id])

    reservation = Reservation.create!(
      user_id: current_user.id,
      property_id: booking_payments_params[:property_id],
      checkin_date: booking_payments_params[:checkin_date],
      checkout_date: booking_payments_params[:checkout_date]
    )

    Payment.create!(
      reservation_id: reservation.id,
      per_night: @property.price,
      base_fare: Money.from_amount(BigDecimal(booking_payments_params[:base_fare])),
      service_fee: Money.from_amount(BigDecimal(booking_payments_params[:service_fee])),
      total_amount: Money.from_amount(BigDecimal(booking_payments_params[:total_amount])),
    )

    # TODO: redirect to all bookings page or show a success message
    redirect_to root_path, notice: 'Your booking has been completed.'
  end

  private

  def booking_payments_params
    params.permit(
      :property_id, 
      :checkin_date, 
      :checkout_date, 
      :base_fare, 
      :service_fee,
      :total_amount
    )
  end
end

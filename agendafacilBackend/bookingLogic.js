function normalizeDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  return String(value).split('T')[0];
}

function getTimeSlotsForDate(dateString) {
  if (!dateString) return [];

  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDay();

  if (day === 6) {
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00'
    ];
  }

  if (day === 0) {
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00'
    ];
  }

  return [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];
}

function buildAvailability(dateString, professional, existingAppointments = []) {
  const normalizedDate = normalizeDateInput(dateString);
  const slots = getTimeSlotsForDate(normalizedDate);

  const bookedSlots = existingAppointments
    .filter((appointment) => !appointment.canceled && appointment.status !== 'cancelado')
    .filter((appointment) => appointment.profissional === professional)
    .filter((appointment) => appointment.data === normalizedDate)
    .filter((appointment) => !appointment.extra)
    .map((appointment) => appointment.horario);

  const extraSlots = existingAppointments
    .filter((appointment) => !appointment.canceled && appointment.status !== 'cancelado')
    .filter((appointment) => appointment.profissional === professional)
    .filter((appointment) => appointment.data === normalizedDate)
    .filter((appointment) => appointment.extra)
    .map((appointment) => appointment.horario);

  return {
    date: normalizedDate,
    professional,
    availableSlots: slots.filter((slot) => !bookedSlots.includes(slot)),
    bookedSlots: Array.from(new Set(bookedSlots)),
    extraSlots: Array.from(new Set(extraSlots))
  };
}

module.exports = {
  normalizeDateInput,
  getTimeSlotsForDate,
  buildAvailability
};

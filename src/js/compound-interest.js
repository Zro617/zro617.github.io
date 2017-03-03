function CompoundInterest(principal,rate,time,compounds) {
  return principal * Math.pow(1 + rate/compounds, time * compounds);
}
function ContinuousCompoundInterest(principal,rate,time) {
  return principal * Math.exp(rate * time);
}
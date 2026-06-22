export function calculateBMI(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bmi: 0,
      classification: "Không xác định",
      level: "normal"
    };
  }

  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));

  let classification, level;

  if (bmi < 18.5) {
    classification = "Gầy";
    level = "underweight";
  } else if (bmi < 25) {
    classification = "Bình thường";
    level = "normal";
  } else if (bmi < 30) {
    classification = "Thừa cân";
    level = "overweight";
  } else {
    classification = "Béo phì";
    level = "obese";
  }

  return { bmi, classification, level };
}
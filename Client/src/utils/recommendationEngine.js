const THEMES = {
  eating:   { label: 'Dinh dưỡng',   gradient: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)', accent: '#4caf50' },
  hydration:{ label: 'Nước uống',    gradient: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5fc 100%)', accent: '#42a5f5' },
  exercise: { label: 'Vận động',     gradient: 'linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)', accent: '#ff9800' },
  sleep:    { label: 'Giấc ngủ',     gradient: 'linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%)', accent: '#e65100' },
  cooking:  { label: 'Mẹo nấu ăn',   gradient: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)', accent: '#f9a825' },
  motivation:{ label: 'Động lực',     gradient: 'linear-gradient(135deg, #e0f7e9 0%, #dcedc8 100%)', accent: '#66bb6a' },
};

const DATABASE = {
  motivation: [
    'Mỗi bữa ăn lành mạnh là một bước tiến nhỏ nhưng vững chắc cho sức khỏe của bạn.',
    'Bạn không cần hoàn hảo, chỉ cần kiên trì. Hôm nay bạn đã chọn điều tốt cho mình.',
    'Cơ thể bạn biết ơn những gì bạn ăn hôm nay. Tiếp tục nhé!',
    'Sức khỏe tốt không đến từ một bữa ăn, mà từ chuỗi những lựa chọn đúng đắn.',
    'Đừng so sánh bữa ăn của mình với người khác. Mỗi cơ thể có nhu cầu riêng.',
    'Ăn uống lành mạnh là cách yêu thương bản thân mỗi ngày.',
    'Một ly nước, một phần rau, một bước đi — nhỏ nhưng tạo nên khác biệt lớn.',
    'Hôm nay bạn đã nỗ lực vì sức khỏe. Đó đã là chiến thắng.',
    'Tiến bộ chậm vẫn tốt hơn là đứng yên. Bạn đang làm rất tốt!',
    'Thói quen tốt được xây dựng từng ngày. Bạn đang trên con đường đúng.',
    'Không có bữa ăn nào "lỗi" — chỉ có bữa tiếp theo tốt hơn.',
    'Cơ thể bạn là nơi bạn sống cả đời. Hãy chăm sóc nó thật tốt.',
    'Bạn xứng đáng có một sức khỏe tốt. Hãy tiếp tục chọn điều tốt cho mình.',
    'Hôm nay bạn uống đủ nước chưa? Đó là bước đơn giản nhất để khỏe mạnh hơn.',
    'Mỗi ngày là cơ hội mới để bắt đầu lại. Đừng ngại bắt đầu.',
    'Ăn chậm, thưởng thức từng miếng — đó cũng là một dạng thiền.',
    'Sức khỏe là tài sản quý giá nhất. Bạn đang đầu tư đúng chỗ.',
    'Không cần phải thay đổi tất cả cùng lúc. Bắt đầu từ một bữa ăn.',
    'Bạn đang xây dựng phiên bản khỏe mạnh hơn của chính mình. Tuyệt vời!',
    'Tự hào về bạn vì đã quan tâm đến sức khỏe của mình hôm nay.',
    'Mỗi lựa chọn thực phẩm đều là một lời nhắn nhủ đến cơ thể: "Mình yêu bạn."',
    'Hôm nay bạn có thể không hoàn hảo, nhưng bạn đã cố gắng. Đó mới là quan trọng.',
    'Sức khỏe tốt là món quà bạn tặng chính mình mỗi ngày.',
    'Đừng bỏ cuộc vì kết quả chưa thấy ngay. Cơ thể bạn đang thay đổi từng ngày.',
    'Bạn đáng được khỏe mạnh và hạnh phúc. Hãy tiếp tục nhé!',
    'Mỗi bữa ăn lành mạnh là một khoản đầu tư cho tương lai của bạn.',
    'Hôm nay bạn chọn gì cho bữa trưa? Hãy chọn thứ khiến bạn cảm thấy tốt về bản thân.',
    'Sức khỏe không phải mục tiêu cuối cùng, mà là hành trình bạn đang đi.',
    'Bạn đang làm tốt hơn bạn nghĩ. Hãy tiếp tục!',
    'Mỗi ngày mới là cơ hội để bạn khỏe mạnh hơn ngày hôm qua.',
  ],
  eating: [
    'Thêm rau xanh vào bữa ăn giúp bổ sung vitamin và chất xơ cần thiết cho cơ thể.',
    'Ăn nhiều rau màu sắc đa dạng sẽ cung cấp đủ loại dưỡng chất khác nhau.',
    'Bữa sáng giàu protein giúp bạn no lâu và duy trì năng lượng đến giờ trưa.',
    'Thay cơm trắng bằng gạo lứt hoặc yến mạch giúp ổn định đường huyết tốt hơn.',
    'Ăn chậm, nhai kỹ giúp hệ tiêu hóa hoạt động hiệu quả và吸收 tốt hơn.',
    'Kết hợp protein với chất xơ trong mỗi bữa ăn giúp cân bằng dinh dưỡng.',
    'Trái cây tươi là lựa chọn bữa phụ tốt hơn snack chế biến sẵn.',
    'Đậu và các loại hạt là nguồn protein thực vật tuyệt vời cho bữa ăn.',
    'Cá hồi, cá thu富含 omega-3 tốt cho tim mạch và trí não.',
    'Salad không chỉ là rau sống — thêm đậu, trứng hoặc thịt nướng sẽ đủ chất hơn.',
    'Uống nước trước bữa ăn giúp bạn cảm thấy no và ăn ít hơn.',
    'Chọn sữa chua nguyên chất thay vì sữa chua có đường để tốt cho hệ tiêu hóa.',
    'Ăn trái cây whole thay vì nước ép trái cây để giữ lại chất xơ.',
    'Bổ sung tỏi, gừng vào bữa ăn giúp tăng cường hệ miễn dịch.',
    'Ăn sáng trong vòng 1 giờ sau khi thức dậy giúp metabolism hoạt động tốt.',
    'Thay đồ ăn vặt bằng các loại hạt rang không muối giúp cơ thể khỏe mạnh hơn.',
    'Thêm nghệ vào món ăn giúp chống viêm và tốt cho khớp.',
    'Ăn cá ít nhất 2 lần mỗi tuần giúp cung cấp omega-3 cho cơ thể.',
    'Chọn thịt nướng hoặc hấp thay vì chiên rán để giảm chất béo bão hòa.',
    'Ăn đủ 3 bữa chính và 2 bữa phụ giúp duy trì năng lượng cả ngày.',
  ],
  cooking: [
    'Hấp hoặc luộc rau giúp giữ lại nhiều vitamin hơn là chiên xào.',
    'Sử dụng nồi không dính giúp giảm lượng dầu cần thiết khi nấu ăn.',
    'Nấu súp hoặc hầm giúp chiết xuất dưỡng chất từ xương và rau củ.',
    'Chế biến thực phẩm tươi sống mỗi ngày giúp đảm bảo dinh dưỡng tốt nhất.',
    'Nướng trong lò hoặc air fryer là cách thay thế chiên rán lành mạnh hơn.',
    'Chuẩn bị bữa ăn sẵn (meal prep) giúp bạn kiểm soát khẩu phần và dinh dưỡng.',
    'Sử dụng gia vị tự nhiên như tỏi, ớt, nghệ thay vì nước mắm nhiều muối.',
    'Cắt rau củ thành miếng lớn giúp giữ nước và dinh dưỡng tốt hơn khi nấu.',
    'Nấu cơm gạo lứt cần nhiều nước hơn gạo trắng — tỷ lệ 1:2.5 là lý tưởng.',
    'Thêm nước dùng (broth) khi nấu giúp món ăn thơm ngon mà không cần thêm muối.',
    'Sử dụng chanh hoặc giấm để tăng hương vị thay vì muối.',
    'Xào nhanh火候 lớn giúp rau giữ được độ giòn và vitamin.',
    'Marinade thịt với nước ép trái cây giúp tenderize tự nhiên mà không cần hóa chất.',
    'Đun sôi nước dùng từ xương trong 4-6 giờ giúp chiết xuất collagen và khoáng chất.',
    'Sử dụng nồi đất nung giúp giữ nhiệt đều và món ăn thơm ngon hơn.',
    'Nấu súp rau củ giúp tiêu hóa dễ dàng và cung cấp nhiều dưỡng chất.',
    'Thêm nấm vào món ăn giúp tăng cường hệ miễn dịch nhờ beta-glucan.',
    'Sử dụng dầu ô liu nguyên chất (extra virgin) để trộn salad giúp hấp thu vitamin tan trong dầu.',
    'Luộc trứng chín vừa (soft boiled) giúp giữ lại nhiều dinh dưỡng hơn.',
    'Chế biến thực phẩm theo mùa giúp đảm bảo tươi ngon và bổ dưỡng.',
  ],
  hydration: [
    'Uống đủ nước mỗi ngày giúp làn da sáng mịn và hệ tiêu hóa hoạt động tốt.',
    'Cơ thể thiếu nước có thể gây đau đầu và mệt mỏi. Hãy uống nước đều đặn.',
    'Mỗi sáng thức dậy, uống một ly nước ấm giúp kích thích tiêu hóa.',
    'Uống nước trước khi tập luyện giúp cơ thể hoạt động hiệu quả hơn.',
    'Nước ấm với chanh vào buổi sáng giúp detox tự nhiên cho cơ thể.',
    'Đặt bình nước trên bàn làm việc giúp bạn uống đủ nước trong ngày.',
    'Khi cảm thấy đói, hãy uống nước trước — đôi khi cơ thể chỉ đang khát.',
    'Ăn nhiều trái cây mọng nước như dưa hấu, cam, dưa chuột giúp bổ sung nước.',
    'Uống nước từ từ, từng ngụm nhỏ giúp cơ thể hấp thụ tốt hơn.',
    'Trà xanh không đường là lựa chọn tốt để bổ sung nước và chất chống oxy hóa.',
    'Hạn chế đồ uống có ga — chúng gây đầy bụng và không tốt cho răng.',
    'Uống nước ấm giúp cơ thể dễ chịu hơn nước lạnh尤其是在 bữa ăn.',
    'Mỗi bữa ăn nên uống một ly nước nhỏ để hỗ trợ tiêu hóa.',
    'Khi vận động ngoài trời, uống nước mỗi 15-20 phút để tránh mất nước.',
    'Nước dừa tự nhiên là thức uống bổ sung điện giải tuyệt vời sau tập luyện.',
    'Hạn chế cà phê tối đa 3 tách mỗi ngày để không ảnh hưởng giấc ngủ.',
    'Uống nước rau luộc (nước canh) giúp bổ sung khoáng chất tự nhiên.',
    'Mùa hè nên uống nhiều nước hơn vì cơ thể mất nước qua mồ hôi.',
    'Mang theo bình nước khi ra ngoài giúp bạn không quên uống nước.',
    'Nước chanh pha loãng giúp tăng hương vị và bạn sẽ uống nhiều nước hơn.',
  ],
  exercise: [
    'Chỉ 30 phút đi bộ mỗi ngày đã giúp giảm nguy cơ bệnh tim mạch đáng kể.',
    'Đứng dậy và duỗi người mỗi 1 tiếng khi làm việc giúp cơ thể linh hoạt.',
    'Yoga buổi sáng giúp tinh thần minh mẫn và cơ thể dẻo dai cả ngày.',
    'Đi bộ nhanh 10.000 bước mỗi ngày giúp duy trì cân nặng và sức khỏe tim.',
    'Tập thể dục nhẹ nhàng sau bữa ăn giúp kiểm soát đường huyết tốt hơn.',
    'Đạp xe là bài tập cardio tuyệt vời giúp đốt cháy calo mà ít tác động khớp.',
    'Tăng cường vận động bằng cách đi thang bộ thay vì thang máy.',
    'Kéo giãn cơ mỗi sáng giúp giảm đau nhức và tăng linh hoạt.',
    'Tập aerobic 3 lần mỗi tuần giúp cải thiện sức bền và sức khỏe tim mạch.',
    'Nhảy dây 15 phút đốt cháy calo tương đương 30 phút chạy bộ.',
    'Ngồi thiền 10 phút mỗi ngày giúp giảm stress và cải thiện tập trung.',
    'Tập plank mỗi ngày giúp tăng cường cơ core và cải thiện tư thế.',
    'Đi bộ đường dốc hoặc leo đồi giúp tăng cường sức mạnh cơ chân.',
    'Tập thể dục nhóm giúp tăng motivation và enjoyment.',
    'Bơi lội là bài tập toàn thân tốt nhất giúp phát triển cơ bắp đều.',
    'Tăng dần cường độ tập luyện giúp cơ thể thích nghi và tránh chấn thương.',
    'Sau 30 phút tập luyện, bổ sung protein giúp cơ bắp phục hồi nhanh hơn.',
    'Không tập quá sức — cơ thể cần thời gian nghỉ ngơi để phục hồi.',
    'Đi bộ sau bữa tối giúp tiêu hóa tốt và kiểm soát đường huyết.',
    'Tập thể dục đều đặn giúp giấc ngủ sâu và ngon hơn vào ban đêm.',
  ],
  sleep: [
    'Ngủ đủ 7-8 tiếng mỗi đêm giúp cơ thể phục hồi và tái tạo năng lượng.',
    'Tránh sử dụng điện thoại 30 phút trước khi ngủ để giấc ngủ sâu hơn.',
    'Phòng ngủ tối và mát giúp melatonin tiết ra tốt hơn cho giấc ngủ ngon.',
    'Ăn nhẹ trước khi ngủ (sữa ấm, chuối) giúp giấc ngủ ổn định hơn.',
    'Giờ đi ngủ cố định mỗi ngày giúp đồng hồ sinh học hoạt động ổn định.',
    'Tránh caffein sau 2 giờ chiều để không ảnh hưởng giấc ngủ tối.',
    'Tắm nước ấm trước khi ngủ giúp thư giãn cơ thể và dễ đi vào giấc ngủ.',
    'Đọc sách 15 phút trước khi ngủ giúp tinh thần thư giãn và ngủ ngon hơn.',
    'Thiền hoặc hít thở sâu trước khi ngủ giúp giảm lo âu và insomnia.',
    'Giặt chăn ga regularly giúp giấc ngủ thoải mái và sạch sẽ hơn.',
    'Tránh bữa ăn lớn trước khi ngủ 2-3 tiếng để hệ tiêu hóa được nghỉ.',
    'Tiếng ồn trắng (white noise) giúp giấc ngủ sâu hơn trong môi trường ồn.',
    'Nằm ngửa giúp giảm đau lưng và cải thiện chất lượng giấc ngủ.',
    'Ánh sáng vàng trong phòng ngủ giúp cơ thể dễ ngủ hơn ánh sáng trắng.',
    'Tập thể dục đều đặn giúp giấc ngủ ngon hơn, nhưng tránh tập sát giờ ngủ.',
    'Thiếu ngủ làm tăng cảm giác đói và thèm đồ ngọt — ngủ đủ giúp kiểm soát cân nặng.',
    'Mùa đông nên đắp chăn mỏng vừa phải — quá nóng cũng ảnh hưởng giấc ngủ.',
    'Đặt đồng hồ báo thức giờ cố định giúp cơ thể tự thức dậy tự nhiên.',
    'Giấc ngủ ngắn 20 phút buổi trưa giúp phục hồi năng lượng mà không ảnh hưởng ngủ tối.',
    'Hít thở không khí trong lành trước khi ngủ giúp tinh thần thư giãn.',
  ],
};

const TIME_RANGES = [
  { start: 5,  end: 9,  periods: ['eating', 'hydration', 'motivation'] },
  { start: 9,  end: 12, periods: ['exercise', 'eating', 'motivation'] },
  { start: 12, end: 14, periods: ['eating', 'cooking', 'hydration'] },
  { start: 14, end: 17, periods: ['hydration', 'exercise', 'motivation'] },
  { start: 17, end: 21, periods: ['eating', 'cooking', 'hydration'] },
  { start: 21, end: 24, periods: ['sleep', 'eating', 'motivation'] },
  { start: 0,  end: 5,  periods: ['sleep', 'motivation', 'hydration'] },
];

const USAGE_KEY = 'smartmeal_tip_usage';

function getUsageCounts() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function incrementUsage(text) {
  const counts = getUsageCounts();
  counts[text] = (counts[text] || 0) + 1;
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

function pickLeastUsed(pool) {
  const counts = getUsageCounts();
  const scored = pool.map(text => ({ text, count: counts[text] || 0 }));
  scored.sort((a, b) => a.count - b.count);
  const minCount = scored[0].count;
  const candidates = scored.filter(s => s.count === minCount);
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  incrementUsage(pick.text);
  return pick.text;
}

function getTimePeriod(hour) {
  return TIME_RANGES.find(r => hour >= r.start && hour < r.end) || TIME_RANGES[6];
}

function analyzeNutritionContext(totalsToday, dailyTargets) {
  const deficits = [];
  const caloriePct = (totalsToday.calories / dailyTargets.calories) * 100;
  const proteinPct = (totalsToday.protein / dailyTargets.protein) * 100;

  if (caloriePct < 30) deficits.push('lowCalories');
  if (caloriePct > 90) deficits.push('highCalories');
  if (proteinPct < 30) deficits.push('lowProtein');

  return { deficits, caloriePct, proteinPct };
}

function getContextualPriority(periods, deficits) {
  const priority = [];

  if (periods.includes('eating')) {
    if (deficits.includes('lowCalories')) priority.push('eating');
    if (deficits.includes('lowProtein')) priority.push('eating');
  }

  if (deficits.includes('highCalories')) {
    priority.push('exercise');
  }

  periods.forEach(p => {
    if (!priority.includes(p)) priority.push(p);
  });

  return priority;
}

let lastTip = '';

export function getRecommendation({ totalsToday, dailyTargets, healthProfile }) {
  const hour = new Date().getHours();
  const timePeriod = getTimePeriod(hour);

  const deficits = totalsToday
    ? analyzeNutritionContext(totalsToday, dailyTargets).deficits
    : [];

  const prioritized = getContextualPriority(timePeriod.periods, deficits);

  for (const theme of prioritized) {
    const pool = DATABASE[theme];
    if (!pool || pool.length === 0) continue;

    const available = pool.filter(t => t !== lastTip);
    if (available.length === 0) continue;

    const tip = pickLeastUsed(available);
    lastTip = tip;
    return {
      text: tip,
      theme,
      ...THEMES[theme],
    };
  }

  const fallback = pickLeastUsed(DATABASE.motivation);
  lastTip = fallback;
  return {
    text: fallback,
    theme: 'motivation',
    ...THEMES.motivation,
  };
}

export { THEMES };

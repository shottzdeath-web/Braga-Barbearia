
const SUPABASE_URL = "COLE_A_URL_DO_SEU_PROJETO";
const SUPABASE_PUBLISHABLE_KEY = "COLE_SUA_CHAVE_PUBLICA";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const dateInput = document.querySelector("#date");
const timeSelect = document.querySelector("#time");
const form = document.querySelector("#bookingForm");
const statusMessage = document.querySelector("#status");
const submitButton = form.querySelector('button[type="submit"]');

document.querySelector("#year").textContent = new Date().getFullYear();

const times = [
  "08:15", "09:00", "09:25", "10:00",
  "10:45", "11:30", "12:40", "13:30",
  "14:15", "15:00", "15:45", "16:30",
  "17:15", "18:00"
];

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

dateInput.min = getLocalDate();

dateInput.addEventListener("change", () => {
  timeSelect.innerHTML = "";
  statusMessage.textContent = "";

  if (!dateInput.value) {
    timeSelect.add(new Option("Escolha a data primeiro", ""));
    return;
  }

  if (dateInput.value < getLocalDate()) {
    timeSelect.add(new Option("Data inválida", ""));
    statusMessage.textContent = "Escolha uma data de hoje em diante.";
    return;
  }

  const selectedDate = new Date(dateInput.value + "T12:00:00");

  if (selectedDate.getDay() === 0) {
    timeSelect.add(new Option("Fechado aos domingos", ""));
    statusMessage.textContent = "Não atendemos aos domingos.";
    return;
  }

  timeSelect.add(new Option("Selecione um horário", ""));

  times.forEach((time) => {
    timeSelect.add(new Option(time, time));
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.querySelector("#name").value.trim();
  const telefone = document.querySelector("#phone").value.trim();
  const servico = document.querySelector("#service").value;
  const data_agendamento = dateInput.value;
  const horario = timeSelect.value;

  if (!nome || !telefone || !servico || !data_agendamento || !horario) {
    statusMessage.textContent = "Preencha todos os campos.";
    return;
  }

  if (data_agendamento < getLocalDate()) {
    statusMessage.textContent = "Escolha uma data válida.";
    return;
  }

  if (new Date(data_agendamento + "T12:00:00").getDay() === 0) {
    statusMessage.textContent = "Não atendemos aos domingos.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "ENVIANDO...";
  statusMessage.textContent = "";

  try {
    const { error } = await supabaseClient
      .from("agendamentos")
      .insert({
        nome,
        telefone,
        servico,
        data_agendamento,
        horario,
        status: "pendente"
      });

    if (error) {
      console.error(error);

      statusMessage.textContent =
        error.code === "23505"
          ? "Esse horário já foi reservado. Escolha outro."
          : "Não foi possível enviar. Confira a configuração do banco.";
      return;
    }

    statusMessage.textContent =
      "Agendamento solicitado com sucesso! Aguarde a confirmação.";

    form.reset();
    dateInput.min = getLocalDate();
    timeSelect.innerHTML = "";
    timeSelect.add(new Option("Escolha a data primeiro", ""));
  } catch (error) {
    console.error(error);
    statusMessage.textContent =
      "Erro de conexão. Verifique a internet e tente novamente.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML =
      'SOLICITAR AGENDAMENTO <span>→</span>';
  }
});

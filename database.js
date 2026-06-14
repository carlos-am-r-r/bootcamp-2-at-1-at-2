// database.js
const SUPABASE_URL = 'https://zxlwjiaknmjzagxvfyje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bHdqaWFrbm1qemFneHZmeWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTI2MDcsImV4cCI6MjA5NjY4ODYwN30.2EUb3uEZv8yPOwKfKXMRz6EDSy0VUVjwlYOthrLrHvg';

// Usando um nome diferente para não conflitar com a variável global 'supabase'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Funções para as Tarefas ---
async function carregarTarefas() {
    const { data, error } = await supabaseClient
        .from('tarefas')
        .select('*')
        .order('id', { ascending: true });
    if (error) {
        console.error('Erro ao carregar:', error);
        return [];
    }
    return data.map(tarefa => ({
        id: tarefa.id,
        text: tarefa.descricao,
        completed: tarefa.concluida
    }));
}

async function salvarTarefa(novaTarefa) {
    const { data, error } = await supabaseClient
        .from('tarefas')
        .insert([novaTarefa])
        .select();
    if (error) {
        console.error('Erro ao salvar:', error);
        return null;
    }
    return {
        id: data[0].id,
        text: data[0].descricao,
        completed: data[0].concluida
    };
}

async function atualizarTarefa(id, concluida) {
    const { error } = await supabaseClient
        .from('tarefas')
        .update({ concluida: concluida })
        .eq('id', id);
    if (error) console.error('Erro ao atualizar:', error);
}

async function deletarTarefa(id) {
    const { error } = await supabaseClient
        .from('tarefas')
        .delete()
        .eq('id', id);
    if (error) console.error('Erro ao deletar:', error);
}

async function editarTarefaTexto(id, novoTexto) {
    const { error } = await supabaseClient
        .from('tarefas')
        .update({ descricao: novoTexto })
        .eq('id', id);
    if (error) console.error('Erro ao editar texto:', error);
}
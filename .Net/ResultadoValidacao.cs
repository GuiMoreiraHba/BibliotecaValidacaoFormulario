public class ResultadoValidacao
{
    public bool Valido { get; set; }
    public string Motivo { get; set; }
    public string RiscoGeral { get; set; }
    public List<Problema> Problemas { get; set; }
    public long TempoValidacao { get; set; }
}
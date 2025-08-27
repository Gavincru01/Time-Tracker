using System.Net.Mail;

namespace AuthApi.Services;

public class EmailSender(IConfiguration cfg)
{
    private readonly string _host = cfg["Mail:SmtpHost"]!;
    private readonly int _port = int.Parse(cfg["Mail:SmtpPort"]!);
    private readonly string _fromEmail = cfg["Mail:FromEmail"]!;
    private readonly string _fromName = cfg["Mail:FromName"]!;

    public Task SendAsync(string to, string subject, string body)
    {
        using var client = new SmtpClient(_host, _port);
        var msg = new MailMessage($"{_fromName} <{_fromEmail}>", to, subject, body) { IsBodyHtml = false };
        client.Send(msg);
        return Task.CompletedTask;
    }
}
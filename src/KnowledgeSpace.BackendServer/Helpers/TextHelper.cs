using System.Text;
using System.Text.RegularExpressions;

namespace KnowledgeSpace.BackendServer.Helpers;

public partial class TextHelper
{
    public static string ToUnsignedString(string input)
    {
        input = input.Trim();
        for (var i = 0x20; i < 0x30; i++)
        {
            input = input.Replace(((char)i).ToString(), " ");
        }
        input = input.Replace(".", "-");
        input = input.Replace(" ", "-");
        input = input.Replace(",", "-");
        input = input.Replace(";", "-");
        input = input.Replace(":", "-");
        input = input.Replace("  ", "-");
        var regex = MyRegex();
        var str = input.Normalize(NormalizationForm.FormD);
        var str2 = regex.Replace(str, string.Empty).Replace('đ', 'd').Replace('Đ', 'D');
        while (str2.Contains('?'))
        {
            str2 = str2.Remove(str2.IndexOf('?'), 1);
        }
        while (str2.Contains("--"))
        {
            str2 = str2.Replace("--", "-").ToLower();
        }
        return str2;
    }

    [GeneratedRegex(@"\p{IsCombiningDiacriticalMarks}+")]
    private static partial Regex MyRegex();
}

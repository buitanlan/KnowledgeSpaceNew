using FluentValidation;

namespace KnowledgeSpace.ViewModels.Systems;

public class FunctionCreateRequestValidator: AbstractValidator<FunctionCreateRequest>
{
    public FunctionCreateRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id value is required")
            .MaximumLength(50).WithMessage("Function id cannot over limit 50 characters");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name value is required")
            .MaximumLength(200).WithMessage("Function id cannot over limit 200 characters");
        RuleFor(x => x.Url).NotEmpty().WithMessage("Url value is required")
            .MaximumLength(200).WithMessage("Function id cannot over limit 200 characters");
        RuleFor(x => x.ParentId).MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.ParentId))
            .WithMessage("Function id cannot over limit 50 characters");
    }
}
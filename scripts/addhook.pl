#!/usr/bin/perl
# Add `import { useTranslation } from 'next-i18next'` (if missing) and
# `const { t } = useTranslation('common');` as the first line of the named component.
# usage: perl scripts/addhook.pl FILE ComponentName [ComponentName...]
use strict; use warnings;
my ($file, @components) = @ARGV;
local $/; open my $fh, '<', $file or die "$file: $!"; my $src = <$fh>; close $fh;
unless ($src =~ /import \{ useTranslation \} from 'next-i18next';/) {
	$src =~ s/^(import [^\n]*\n)/$1import { useTranslation } from 'next-i18next';\n/ or die "no import line";
}
for my $c (@components) {
	# block body: `const C = (...) => {` or `const C: NextPage = (...) => {`
	if ($src =~ s/^(const \Q$c\E\b[^\n]*=> \{\n)(?!\tconst \{ t \})/$1\tconst { t } = useTranslation('common');\n/m) { next }
	# expression body: `const C = (...) => (` ... `\n);` → block with hook
	$src =~ s/^(const \Q$c\E\b[^\n]*=> )\(\n(.*?)\n\);\n/$1\{\n\tconst { t } = useTranslation('common');\n\treturn (\n$2\n\t);\n};\n/ms
		or warn "$file: component $c not found\n";
}
open $fh, '>', $file or die; print $fh $src; close $fh;
print "$file ok\n";

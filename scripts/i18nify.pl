#!/usr/bin/perl
# Wrap literal UI strings of one .tsx file in t('...').
# usage: perl scripts/i18nify.pl FILE "String one" "String two" ...
# Handles: JSX text alone on a line, attribute="String", and >String< inline text.
use strict; use warnings;
my ($file, @strings) = @ARGV;
local $/; open my $fh, '<', $file or die "$file: $!"; my $src = <$fh>; close $fh;
my $n = 0;
for my $s (@strings) {
	my $q = quotemeta $s;
	(my $k = $s) =~ s/'/\\'/g;
	$n += ($src =~ s/^(\s*)$q\s*$/$1\{t('$k')\}/mg);
	$n += ($src =~ s/\b(placeholder|title|label|aria-label|alt)="$q"/$1=\{t('$k')\}/g);
	$n += ($src =~ s/>$q</>\{t('$k')\}</g);
}
open $fh, '>', $file or die; print $fh $src; close $fh;
print "$file: $n replacements\n";

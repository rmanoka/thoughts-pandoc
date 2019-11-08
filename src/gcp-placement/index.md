---
title: GCP Placement
...

\newcommand{\area}{\operatorname{\mu}}
\newcommand{\dist}{\operatorname{\mathcal{D}}}
\newcommand{\heat}{\operatorname{\mathcal{H}}}
\newcommand{\reals}{\mathcal{R}}
\newcommand{\curly}[1]{\left\{{#1}\right\}}
\newcommand{\brac}[1]{\left[{#1}\right]}
\newcommand{\paren}[1]{\left({#1}\right)}
\newcommand{\X}{\mathcal{X}}
\newcommand{\aoi}{\mathcal{A}}
\newcommand{\gcps}{\mathcal{G}}
\newcommand{\ball}{\operatorname{\mathcal{B}}}
\newcommand{\defeq}{\stackrel{\Delta}{=}}
\newcommand{\prob}{\operatorname{\mathbb{Pr}}}
\newcommand{\exp}{\operatorname{\mathbb{E}}}

Ground control points, or GCPs, are crucial in
photogrammetry to obtain accurate outputs. These are
typically clearly visible physical markers on the ground,
for which _highly accurate positional information_ is
available. The accurate positions are used in photogrammetry
to improve the accuracy of the outputs.

GCPs form an integral part of the Vimana platform. We
provide workflow for the placement, and usage of GCPs.

In this blog, we describe our procedure for the placement of
GCPs.

# Algorithm

Based on our experiments, we design algorithms for GCP
placement based on the coverage radius. In particular, we
provide algorithms for:

- **Coverage Estimation.** Given existing AOI, and GCPs,
  compute the coverage radius of the GCPs. This allows
  quality check of GCPs placed on site.

- **GCP Placement.** Given an AOI, and a coverage radius,
  compute a placement of GCPs with the given coverage. This
  enables placement of GCPs in both new sites, and sites
  with a few existing GCPs.

**Notation.** We think of a region as a subset of the 2-D
plane, with a positive area. We represent regions by
caligraphic letters: $\aoi, \X,$ etc. The area of a region
is denoted by $\area(\cdot)$. The ball of radius R around a
point p is represented by $\ball(p, R).$

# Coverage and Heatmaps

We address the simpler question of estimating the coverage
of a given set of GCPs, $\gcps$ within an AOI $\aoi.$ The
region covered by a single point $p \in \aoi$ upto radius
$R$ is $\ball(p, R).$ Thus, the total region covered by the
GCPs upto radius R, gives the "heatmap" of the GCPs at
radius R:

$$\heat(\gcps, \aoi, R) \defeq
\paren{\bigcup_{p \in \gcps} \ball(p, R)}
\bigcap \aoi.$$

This provides a ready-to-compute formula for generating
heatmap vizualizations. To compute the coverage radius of a
set of GCPs, we perform a binary-search using the above
formula. As the coverage radius may be an arbitrary real
number, we estimate it upto an error $\epsilon.$

::: {.algorithm #estimate-coverage}

EstimateCoverage

**Input.** The AOI, $\aoi$; a set of GCPs, $\gcps$; and an
error threshold $\epsilon.$\
**Output.** The coverage radius $R$, upto error $\pm
  \epsilon.$

---
set: |
  **set**
wh: |
  **while**
ret: |
  **return**
br: |
  **break**
cnt: |
  **continue**
---

1. \set $l = 0, h = 2\operatorname{\mathsf{diam}}(\aoi).$
2. \set $m = (l+h)/2.$
3. \wh $h - l > \epsilon$:
   1. \set $\aoi' = \aoi \setminus \bigcup_{g \in \gcps} \ball(g, m).$
   2. if $\aoi'$ is empty: \set $h = m$, otherwise \set $l = m.$
   3. \set $m = (l+h)/2.$
4. \ret m

:::

# GCP Placement

Our GCP placement problem is a version of [Geometric Set
Cover][GSetCov]. Determining the minimum GCPs (and their
positions), is
[hard](https://doi.org/10.1016%2F0020-0190%2881%2990111-3)
and thus we settle for an approximation algorithm. The
algorithm begins with the initial AOI, denoted $\aoi$, and
iteratively places GCPs, while updating the remaining region
of the AOI to be covered.

The iterative procedure picks the position of the next GCP
by randomly sampling from a distribution that prioritizes
positions that cover maximum area.[^1] The coverage of a
point p on $\aoi$, denoted $\X(p, \aoi)$ is defined as:

$$\X(p, \aoi) \defeq \ball(p, R) \cap \aoi.$$

The distribution, denoted $\dist(\aoi),$ samples a point $p
\in \aoi$ proportional to the area of its coverage, denoted
$\area(\X(p, \aoi)).$

We describe the placement algorithm assuming we can sample
from the distribution $\dist(\aoi).$ The sampling
sub-routine uses a few algorithmic techniques and is
described in the rest of the section.

::: algorithm

GCP Placement

**Input.** The AOI, $\aoi$; coverage radius $R$; and an
error threshold $\epsilon.$\
**Output.** Collection of GCPs, $\gcps.$

1. \set $\gcps = \emptyset$
2. \set $\aoi' = \aoi$
3. \wh $\area(\aoi') > \epsilon$:
   1. sample $p$ from $\dist(\aoi')$
   1. add $p$ to $\gcps$
   1. \set $\aoi' = \aoi' \setminus \X(p)$
1. \ret m

:::

## Uniform Sampling in $\aoi$

We construct a sampler for the distribution $\dist(\aoi)$ by
first sampling uniformly within the region $\aoi$; and then
converting this to the required distribution. The first step
is a simple application of [rejection sampling][RejSample],
and is described below.

::: {.algorithm #uniform-region-sample}

Uniform Region Sample

**Input.** The region, $\aoi.$\
**Output.** A point $p \in \aoi$ picked uniformly at random.

1. \set bbox = bounding box of $\aoi$
1. \wh yet to sample:
   1. sample $p$ uniformly from bbox
   1. if $p \in \aoi$: \br from loop; else \cnt
1. \ret p

:::

The bounding box may be any superset of the region $\aoi$,
where a uniform sampling is easy to obtain. For instance, we
may use the minimum axis parallel rectange covering the AOI;
to uniformly sample point in the bounding box, we sample a
random number between the left and right bounds, and another
between the top and bottom bounds. Note that the sample in
[step (i)](#uniform-region-sample) of the loop is uniform in
the bounding box, and thus is uniform in $\aoi$ when
conditioned on falling inside the region as done in [step
(ii)](#uniform-region-sample).

## Sampling From $\dist(\aoi)$

The sampler for $\dist(\aoi)$ is a more sophisticated
application of rejection sampling. Denoting area of $\aoi$
by $\area(\aoi)$, the uniform distribution over $\aoi$
has prob. density function (pdf):
$$f(p) = \frac{1}{\area(\aoi)}.$$

On the other hand, the distribution $\dist(\aoi)$ has a pdf:

$$g(p) = \frac{\area(\X(p, \aoi))}{\mu(\aoi)\cdot C(\aoi)},$$

where $C(\aoi)$ is the normalization constant:

[$$C(\aoi) = \int_{\aoi} \frac{\area(\X(p, \aoi))}{\area(\aoi)}
 = \exp \brac{\area(\X(p, \aoi))} .$$]{#eq-c-a-constant}

Finally, let $G \ge \sup_\aoi \curly{\frac{g(p)}{f(p)}}$ be
an upper bound on the maximum ratio of the two
distributions. Then, the following algorithm samples from
$\dist(\aoi)$ using the uniform sampler constructed earlier.

::: {.algorithm #coverage-sampler }

Coverage Sampler

**Input.** The region, $\aoi.$\
**Output.** A point $p$ sampled from $\dist(\aoi).$

1. \wh yet to sample:
   1. sample $p$ uniformly in $\aoi$
   1. **accept** and \br with probability $\frac{g(p)}{G \cdot
      f(p)}$
1. \ret p

:::

## Estimate $C(\aoi)$

The coverage sampler algorithm, described above, requires
estimating $C(\aoi)$, and using it, the coefficient $G$. We
estimate $C(\aoi)$ by computing the expectation in
[eq.\ @eq-c-a-constant] at uniform random samples in $\aoi$. To
estimate the confidence and accuracy of this estimate, note
that $\mu(\X(p))$ for $p \in \aoi$ satisfies:

$$0 \le \mu(\X(p)) \le \pi R^2.$$

Then, using [Hoeffding's Inequality][Hoeffdings] the
probability of the average of $n$ samples, denoted
$C_n(\aoi)$, _not_ falling within $\pm\epsilon$ of $C(\aoi)$
is:

[$$ \prob\curly{ \left\lvert C_n(\aoi) - C(\aoi) \right\rvert
\ge \epsilon} \le 2 \operatorname{exp}\paren{\frac{-2n\epsilon^2} {\pi^2
R^4}} .$$]{#eq-sampling-error}

Thus, we get an additive $\epsilon$-approximation with
probability $1 - \delta$ by picking $n$ larger than
$\frac{\pi^2 R^4}{2\epsilon^2}
\log\paren{\frac{2}{\delta}}.$ This yields the following
Monte-Carlo algorithm to estimate $C(\aoi)$.

::: { #estimate-ball-integral .algorithm }

Estimate Ball Integral

**Input.** The region, $\aoi$, error threshold $\epsilon$,
and confidence parameter $\delta$.\
**Output.** Estimate of $C(\aoi)$.

1. Compute $n = \left\lceil \frac{\pi^2 R^4}{2\epsilon^2}
\log\paren{\frac{2}{\delta}} \right\rceil$.
1. \set sum = 0
2. **for** i = $1 \ldots n$:
   1. sample $p$ uniformly in $\aoi$
   2. \set sum = sum + $\area(\X(p, \aoi))$
3. \ret sum / n

:::

Finally, we get a lower bound on the max ratio:
$$G = \frac{\pi R^2}{C_n(\aoi) - \epsilon}$$
where $C_n$ is the estimate using algorithm above, with
$\epsilon$ the error threshold.

## Tuning Confidence

Algorithm @estimate-ball-integral above, and hence our
placement procedure is Monte-Carlo in nature. In particular,
assuming we place k GCPs in total, the probability that the
placement went by plan is $1 - k \delta$.

We obtain a bound on $k$ as follows: the GCPs picked by our
placement are at least distance $R$ from other GCPs. Thus,
$R/2$ radius balls around the GCPs are disjoint. Together,
they may at best, cover the aoi $\aoi$ padded by radius
$R/2$: $\aoi + B(0, R/2).$  Thus:

$$ k \le \frac{4\cdot\area(\aoi + B(0, R/2))}{\pi R^2}.$$

Thus, to get a 90% confidence algorithm, we may set:

$$\delta \le 1/10k \le \frac{\pi R^2}{40 \cdot\area(\aoi +
B(0, R/2))}. $$

[GSetCov]: //en.wikipedia.org/wiki/Geometric_set_cover_problem
[RejSample]: //en.wikipedia.org/wiki/Rejection_sampling
[Hoeffdings]: //en.wikipedia.org/wiki/Hoeffding%27s_inequality

[^1]: A greedy strategy is known to yield poorer results on
    an average.

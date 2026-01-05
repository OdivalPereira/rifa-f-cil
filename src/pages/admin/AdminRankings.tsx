import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Crown, Ticket, Users, Loader2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveRaffle, useReferralRanking, useTopBuyersRanking } from "@/hooks/useRaffle";
import { formatCurrency } from "@/lib/validators";

function RankingBadge({ position }: { position: number }) {
    if (position === 1) {
        return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
    }
    if (position === 2) {
        return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20" />;
    }
    if (position === 3) {
        return <Medal className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
    }
    return <span className="text-muted-foreground font-mono font-medium">#{position}</span>;
}

function LoadingTable() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald" />
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{message}</p>
        </div>
    );
}

export default function AdminRankings() {
    const { data: raffle, isLoading: raffleLoading } = useActiveRaffle();
    const { data: referralRanking, isLoading: referralLoading } = useReferralRanking(raffle?.id, 500); // Admin sees more
    const { data: buyersRanking, isLoading: buyersLoading } = useTopBuyersRanking(raffle?.id, 500); // Admin sees more

    // Format phone number for display
    const formatPhone = (phone: string) => {
        if (!phone) return "-";
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        }
        return phone;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border border-yellow-400/20">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Rankings</h1>
                    <p className="text-muted-foreground">Visualize os maiores compradores e indicadores da rifa ativa</p>
                </div>
            </div>

            <Tabs defaultValue="buyers" className="w-full">
                <TabsList className="bg-card border border-border/50 p-1 mb-6">
                    <TabsTrigger value="buyers" className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        Top Compradores
                    </TabsTrigger>
                    <TabsTrigger value="referrals" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Top Indicadores
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="buyers">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-emerald" />
                                Maiores Compradores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {raffleLoading || buyersLoading ? (
                                <LoadingTable />
                            ) : buyersRanking && buyersRanking.length > 0 ? (
                                <div className="rounded-md border border-border/50 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[100px] text-center">Posição</TableHead>
                                                <TableHead>Comprador</TableHead>
                                                <TableHead>Telefone</TableHead>
                                                <TableHead className="text-right">Números</TableHead>
                                                <TableHead className="text-right">Total Gasto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {buyersRanking.map((buyer, index) => (
                                                <TableRow key={index} className="hover:bg-muted/30">
                                                    <TableCell className="text-center font-medium">
                                                        <div className="flex justify-center">
                                                            <RankingBadge position={index + 1} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {buyer.buyer_name || "Sem nome"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">
                                                        {formatPhone(buyer.buyer_phone)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-emerald">
                                                        {buyer.tickets_bought}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatCurrency(buyer.total_spent)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <EmptyState message="Nenhum comprador encontrado." />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="referrals">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Top Indicadores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {raffleLoading || referralLoading ? (
                                <LoadingTable />
                            ) : referralRanking && referralRanking.length > 0 ? (
                                <div className="rounded-md border border-border/50 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[100px] text-center">Posição</TableHead>
                                                <TableHead>Telefone (ID)</TableHead>
                                                <TableHead>Código</TableHead>
                                                <TableHead className="text-right">Vendas</TableHead>
                                                <TableHead className="text-right">Números Vendidos</TableHead>
                                                <TableHead className="text-right">Receita Gerada</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {referralRanking.map((referral, index) => (
                                                <TableRow key={index} className="hover:bg-muted/30">
                                                    <TableCell className="text-center font-medium">
                                                        <div className="flex justify-center">
                                                            <RankingBadge position={index + 1} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">
                                                        {formatPhone(referral.referrer_phone)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-bold font-mono border border-blue-500/20">
                                                            {referral.referral_code}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {referral.sales_count}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-emerald">
                                                        {referral.tickets_sold}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatCurrency(referral.total_revenue)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <EmptyState message="Nenhuma indicação encontrada." />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

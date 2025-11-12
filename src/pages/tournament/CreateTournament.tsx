import { Fragment, useState } from "react";
import { Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { Trophy } from "lucide-react";
import TournamentForm from "./TournamentForm";
import { SaveTournament } from "../../services/tournament.service";
import { useToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

function CreateTournament() {
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [loader, setLoader] = useState(false);

    const onSubmit = (data) => {
        setLoader(true);
        SaveTournament(data).then((res) => {
            if(res.status) {
                successToast('Created successfully');
                navigate(ROUTES.TOURNAMENT.EDIT(res.data.uuid));
            } else {
                errorToast(res.errorMessage || 'Failed to save tournament');
            }
        }).finally(() => {
            setLoader(false);
        });
    }

    return (
        <Fragment>
            <PageTitle title="Create Tournament" titleIcon={<Trophy />} />
            <Card>
                <CardContent>
                    <TournamentForm formLoader={false} loader={loader} callback={onSubmit}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default CreateTournament

